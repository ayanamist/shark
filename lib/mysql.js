/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

var READONLY = exports.READONLY = 1;
var WRITABLE = exports.WRITABLE = 2;

var Agent = function (options) {

  events.EventEmitter.call(this);

  this._status = 0;

  this._handle = mysql.createConnection(options);

  this._id = util.format('%s@%s:%d', this._handle.config.user, 
      this._handle.config.host, this._handle.config.port);

  (function _errorHandle(m) {
    m._handle.on('error', function (error) {
      if (m._status < 0) {
        return;
      }

      m.emit('error', error);
      if (!error.fatal || 'PROTOCOL_CONNECTION_LOST' !== error.code) {
        return;
      }

      m._handle = mysql.createConnection(m._handle.config);
      _errorHandle(m);
    });
  })(this);
};
util.inherits(Agent, events.EventEmitter);

Agent.prototype.clone = function () {
  return new Agent(this._handle.config);
};

Agent.prototype.query = function (sql, options, callback) {

  var timer = null;

  var _self = this;

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

/* {{{ function _writable() */

var _writable = function (c, f) {
  c.query("SHOW VARIABLES LIKE 'READ_ONLY'", {'timeout' : 100}, function (error, res) {
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

    var idx = agent._id;
    if (backups[idx]) {
      return;
    }

    agent.on('close', function () {
      // XXX:
    });

    backups[idx] = {
      'o' : agent,
      's' : 0,      /**<  状态    */
      'n' : 0,      /**<  连接数  */
      'f' : 0,      /**<  空闲数  */
    };

    (function heartbeat() {
      _writable(agent, function (error, yes) {
        backups[idx].s = error ? 0 : (yes ? (WRITABLE | READONLY) : READONLY);
        setTimeout(heartbeat, 3000);
      });
    })();
  };

  /* }}} */

  _me._query = function (sql, options, callback) {

    var f = function (o) {
      backups[o._id].f--;
      o.query(sql, options, function (error, res) {
        backups[o._id].f++;
        callback(error, res);
      });
    };

    var w = sql.match(/^(SELECT|SHOW|DESC|DESCRIBE|KILL)\s+/i) ? false : true;
    if (w && w_queue.length > 0) {
      w_queue.push(f);
      return;
    }

    if (!w && r_queue.length > 0) {
      r_queue.push(f);
      return;
    }

    for (var i in backups) {
      var a = backups[i];
      if (a.n < _options.poolsize) {
      }
    }

    var p = -1;
    if (sql.match(/^(SELECT|SHOW|DESC|DESCRIBE|KILL)\s+/i)) {
      p = r_queue.push(f);
    } else {
      p = w_queue.push(f);
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

