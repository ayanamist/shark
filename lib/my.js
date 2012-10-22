/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

var READONLY = exports.READONLY = 1;
var WRITABLE = exports.WRITABLE = 2;

/* {{{ function _writable() */

var _writable = function (c, f) {
  c.query("SHOW VARIABLES LIKE 'READ_ONLY%'", function (error, res) {
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
  _writable(_self._handle, function (error, yes) {
    if (error) {
      _self._status = 0;
    } else {
      _self._status = yes ? (READONLY | WRITABLE) : READONLY;
      _self.emit('ready', _self._status);
    }

    next && setTimeout(next, 30000);
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

    _self.emit('error', error);

    /**
     * @ ?
     */
    if (!error.fatal) {
      return;
    }

    console.log(error);
    if ('PROTOCOL_CONNECTION_LOST' !== error.code) {
      return;
    }

    _self._handle = mysql.createConnection(_self._handle.config);
    errorHandle(_self);
  });
};
/* }}} */

var Agent = exports.Agent = function (options) {

  events.EventEmitter.call(this);

  this._status  = 0;

  this._handle  = mysql.createConnection(options);

  errorHandle(this);

  var _self = this;
  _self._handle.connect(function (error) {
    _heartbeat(_self);
  });

};
util.inherits(Agent, events.EventEmitter);

Agent.prototype.query = function (sql, options, callback) {

  if ('function' === (typeof options)) {
    callback = options;
  }

  var _self = this;
  _self._handle.query(sql, function (error, res) {
    callback(error, res);
    var p = _self._handle._protocol;
    if (p && p._queue && !p._queue.length) {
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
  });
};

exports.createPool = function (options) {

  var _options  = {
    'poolsize'  : 4,
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  var r_queue = [];

  var w_queue = [];

  var r_stack = [];

  var w_stack = [];

  var conns = [];

  var _me = {};

  /* {{{ public function addserver() */

  _me.addserver = function (config) {
    var m = new Agent(config);
    var i = conns.push(m);

    m.on('ready', function (flag) {
      if ((flag & WRITABLE) > 0) {
        w_stack.push(i);
      } else if ((flag & READONLY) > 0) {
        r_stack.push(i);
      }
    });
  };

  /* }}} */

  /* {{{ public function query() */

  _me.query = function (sql, options, callback) {
    if (sql.match(/^(SELECT|SHOW|DESC|DESCRIBE|KILL)\s+/i)) {
      r_queue.push('a');
    } else {
      w_queue.push('a');
    }
  };

  /* }}} */

  return _me;
};

