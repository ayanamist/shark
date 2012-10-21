/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var events = require('events');
var mysql = require('mysql');

var Agent = function (options) {

  events.EventEmitter.call(this);

  this.writable = false;

  this._handle  = mysql.createConnection(options);
  this._handle.on('error', function (error) {
    if (error.fatal) {
    }
  });

  this._handle.connect(function (error) {
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
  this._handle.end(callback);
};

