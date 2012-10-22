/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

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

var Agent = function (options) {

  events.EventEmitter.call(this);

  this._status  = 0;

  this._hbtimer = null;

  var _self = this;

  _self._handle  = mysql.createConnection(options);
  _self._handle.on('error', function (error) {
    console.log(error);
    if (error.fatal) {
    }
  });

  /* {{{ private function heartbeat() */

  var heartbeat = function (next) {
    _writable(_self._handle, function (error, yes) {
      if (error) {
        _self._status = 0;
      } else if (yes) {
        _self._status = 3;
      } else {
        _self._status = 1;
      }
      if (next) {
        _self._hbtimer = setTimeout(next, 30000);
      }
    });
  };

  /* }}} */

  _self._handle.connect(function (error) {
    heartbeat(heartbeat);
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
      _self.emit('free');
    }
  });
};

Agent.prototype.close = function (callback) {
  var _self = this;
  if (_self._hbtimer) {
    clearTimeout(_self._hbtimer);
    _self._hbtimer = null;
    _self._status = -1;
  }

  _self._handle.end(function () {
    callback && callback();
    _self._handle = null;
  });
};

