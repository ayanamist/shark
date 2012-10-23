/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

var READONLY = exports.READONLY = 1;
var WRITABLE = exports.WRITABLE = 2;

/* {{{ function _writable() */

var _writable = function (c, f) {
  c.query("SHOW VARIABLES LIKE 'READ_ONLY%'", {'timeout' : 100}, function (error, res) {
    f = f || function () {};
    if (error) {
      return f(error, false);
    }

    var r = {};
    for (var i = 0; i < res.length; i++) {
      r = res[i];
      if (r && r.Variable_name && 'read_only' === r.Variable_name.toLowerCase()) {
        return f(null, r.Value && r.Value.match(/^(off)$/i) ? true : false);
      }
    }

    f(null, false);
  });
};

/* }}} */

/* {{{ function _heartbeat() */
/**
 * @ XXX: 用单独的一个连接处理心跳
 */
var _heartbeat  = function (_self, next) {
  _writable(_self, function (error, yes) {
    if (error) {
      _self._status = 0;
    } else {
      _self._status = yes ? (READONLY | WRITABLE) : READONLY;
    }
    _self.emit('heartbeat', _self._status);
    next && setTimeout(next, 3000);
  });
};
/* }}} */

/* {{{ function errorHandle() */
var errorHandle = function (_self) {
  _self._handle.on('error', function (error) {

    /**
     * @ 准备断开连接
     */
    if (_self._status < 0) {
      return;
    }

    _self._status = 0;
    _self.emit('error', error);

    /**
     * @ 尝试重连
     */
    if (!error.fatal || 'PROTOCOL_CONNECTION_LOST' !== error.code) {
      return;
    }

    _self._handle = mysql.createConnection(_self._handle.config);
    errorHandle(_self);
  });
};
/* }}} */

var Agent = function (options) {

  events.EventEmitter.call(this);

  /**
   * @ 正在运行的SQL
   */
  this._running = 0;

  /**
   * @ 状态
   */
  this._status  = 0;

  this._handle = mysql.createConnection(options);

  errorHandle(this);

};
util.inherits(Agent, events.EventEmitter);

Agent.prototype.clone = function () {
  return new Agent(this._handle.config);
};

Agent.prototype._name = function () {
  var _conf = this._handle.config;
  return util.format('%s@%s:%d', _conf.user, _conf.host, _conf.port);
};

Agent.prototype.query = function (sql, options, callback) {

  var timer = null;

  var _self = this;
  _self._running++;

  if ('function' === (typeof options)) {
    callback = options;
  } else if (options && options.timeout) {
    timer = setTimeout(function () {
      var e = new Error('Mysql query timeout after ' + options.timeout + ' ms.');
      e.name = 'QueryTimeout';
      callback(e);
      callback = function (error, res) {
        _self.emit('timeout', error, res);
      };
    }, options.timeout);
  }

  _self._handle.query(sql, function (error, res) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    callback(error, res);
    if (0 === (--_self._running)) {
      _self.emit('ready', _self._status);
    }
  });
};

Agent.prototype.close = function (callback) {
  var _self = this;
  _self._status = -1;
  _self._handle.end(function (error) {
    callback && callback(error);
    _self._handle = null;
    _self.emit('close');
  });
};

exports.create = function (options) {
  return new Agent(options);
};

exports.createPool = function (options) {

  var _options  = {
    'poolsize'  : 4,
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  /**
   * @ 读请求队列
   */
  var r_queue = [];

  /**
   * @ 写请求队列
   */
  var w_queue = [];

  /**
   * @ 做心跳用的所有对象
   */
  var backups = {};

  /**
   * @ 在线提供服务的对象
   */
  var onlines = [];

  var _agents = [];

  var _me = {};

  /* {{{ public function addserver() */

  _me._addserver = function (agent) {
    if (!(agent instanceof Agent)) {
      agent = new Agent(agent);
    }

    var idx = agent._name();
    if (backups[idx]) {
      return;
    }

    for (var i = 0; i < _options.poolsize; i++) {
      var m = agent.clone();
      m.on('ready', function (flag) {
        if ((flag & WRITABLE) > 0) {
          var f = w_queue.shift() || r_queue().shift();
          f && f(m);
        } else if ((flag & READONLY) > 0) {
          var f = r_queue.shift();
          f && f(m);
        }
      });
      onlines.push(m);
    }

    agent.on('heartbeat', function (flag) {
      onlines.forEach(function (o, i) {
        if (idx === o._name()) {
          onlines[i]._status = flag;
        }
      });
    });

    (function next() {
      _heartbeat(agent, next);
    })();

    backups[idx] = agent;
  };

  /* }}} */

  _me._query = function (sql, options, callback) {

    var f = function (o) {
      o.query(sql, options, callback);
    };

    var p = -1;
    if (sql.match(/^(SELECT|SHOW|DESC|DESCRIBE|KILL)\s+/i)) {
      p = r_queue.push(f);
    } else {
      p = w_queue.push(f);
    }

    if (1 === p) {
      console.log('start');
    }
  };

  /* {{{ public function query() */

  _me.query = function (sql, options, callback) {
    var f = function (o) {
      o.query(sql, options, callback);
    };

    // XXX:
    if (sql.match(/^(SELECT|SHOW|DESC|DESCRIBE|KILL)\s+/i)) {
      r_queue.push(f);
    } else {
      w_queue.push(f);
    }
  };

  /* }}} */

  /* {{{ public function addserver() */

  _me.addserver = function (config) {

    var m = new Agent(config);
    var i = _agents.push(m) - 1;

    m.on('ready', function (flag) {
      if (flag < 0) {
        return;
      }

      if ((flag & WRITABLE) > 0) {
        if (w_queue.length > 0) {
          (w_queue.shift())(m);
        } else if (r_queue.length > 0) {
          (r_queue.shift())(m);
        }
      } else if ((flag & READONLY) > 0) {
        if (r_queue.length > 0) {
          (r_queue.shift())(m);
        }
      }
    });
  };

  /* }}} */

  return _me;
};

