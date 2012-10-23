/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

var Agent = function (options) {

  events.EventEmitter.call(this);

  this._status = 0;
  this._handle = mysql.createConnection(options);
  this._id = util.format('%s@%s:%d', this._handle.config.user, 
      this._handle.config.host, this._handle.config.port);

  this.connect();
}
util.inherits(Agent, events.EventEmitter);

Agent.prototype.connect = function () {
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
  this._handle.connect();
};

Agent.prototype.query = function (sql, data, callback) {
  this._handle.query(sql, data, callback);
};

Agent.prototype.clone = function () {
  return new Agent(this._handle.config);
};

Agent.prototype.close = function (callback) {
  var _self = this;
  _self._status = -1;
  _self._handle.end(function (error) {
    callback && callback(error);
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

var READONLY = 1;
var WRITABLE = 2;

exports.createPool = function (options) {

  var _options  = {
    'poolsize'  : 4,        /**<  连接池大小    */
    'idletime'  : 300000,   /**<  最大空闲时间  */
    'timeout'   : 0,        /**<  执行超时时间  */ 
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  /**
   * @ 写请求队列
   */
  var s_queue = [];

  /**
   * @ 数据库对象
   */
  var w_stack = [];

  /**
   * @ 做心跳用的所有对象
   */
  var backups = {};

  /**
   * @ 在线提供服务的对象
   */
  var onlines = [];

  var start = function () {
    var f, i;
    while (s_queue.length && w_stack.length) {
      i = w_stack.pop();
    }
  };

  var Pool = function () {
    events.EventEmitter.call(this);
  };
  util.inherits(Pool, events.EventEmitter);

  Pool.prototype.addserver = function (config) {
    var _me = new Agent(config);
    var _id = _me._id;
    if (backups[_id]) {
      return;
    }

    _me.on('close', function () {
      _me.connect();
    });

    for (var i = 0; i < _options.poolsize; i++) {
      w_stack.push(onlines.push(_me.clone()) - 1);
    }

    backups[_id] = {
      'o' : _me,
      'n' : _options.poolsize,
      's' : 0,
    };

    (function heartbeat() {
      _writable(_me, function (error, yes) {
        backups[_id].s = error ? 0 : (yes ? (WRITABLE | READONLY) : READONLY);
        setTimeout(heartbeat, 1000);
      });
    })();
  };

  Pool.prototype.query = function (sql, options, callback) {

    if ('function' === (typeof options)) {
      callback = options;
    }

    var _self = this;
    var timeout = options.timeout || _options.timeout;
    if (timeout > 0) {
      var t = setTimeout(function () {
        var e = new Error(util.format('Mysql query timeout after %d ms.', timeout));
        e.name = 'QueryTimeout';
        callback(e);
        callback = function (error, res) {
          _self.emit('timeout', error, res);
        };
      }, timeout);

      callback = function (error, res) {
        clearTimeout(t);
        t = null;
        callback(error, res);
      };
    }

    var n = s_queue.push({
      'sql' : sql,
        'options' : options,
        'cb'  : callback
    });
    if (1 === n) {
      start();
    }
  };

  return new Pool();
};

