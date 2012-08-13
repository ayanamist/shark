/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Redis   = require('redis');

exports.create  = function(servers, options) {

  /**
   * @机器列表
   */
  var _servers  = ['127.0.0.1:6379'];
  if (servers) {
    _servers    = Array.isArray(servers) ? servers : servers.split(',');
  }

  /**
   * @连接配置
   */
  var _options  = options || {};

  /**
   * @连接句柄
   */
  var _handles  = [];

  /**
   * @请求队列
   */
  var _queue    = [];
  var _AfterRedisConnected = function (callback) {
    if (_handles.length < 1) {
      _queue.push(callback);
    } else {
      callback();
    }
  };

  /**
   * @连接函数
   */
  var _connect  = function (item) {
    var _me = item.split(':');
    if (_me.length > 1) {
      var _conn = Redis.createClient(_me[1], _me[0], _options);
    } else {
      var _conn = Redis.createClient(item, _options);
    }

    _conn.on('error', function () {
      require(__dirname + '/factory.js').getLog('error').exception(error);
    });
    _conn.on('ready', function () {
      var p = _handles.push(_conn);
      _conn.on('error', function (error) {
        // XXX: maybe have a bug
        _handles.splice(p - 1, 1);
        setTimeout(function () {
          _connect(item);
        }, 20);
      });
      while (_queue.length) {
        (_queue.shift())();
      }

    });
  };
  _servers.forEach(_connect);

  /**
   * @获取连接
   */
  var _getconn  = function(key) {

    var idx = 5381;
    key = (key instanceof Buffer) ? key : new Buffer(key);
    for (var i = 0, len = key.length; i < len; i++) {
      idx   = (idx << 5 + idx) + key[i];
    }

    return _handles[Math.abs(idx) % _handles.length];
  };

  /**
   * @redis对象
   */
  var _me    = {};

  /* {{{ public function set() */
  _me.get = function(key, callback) {
    _AfterRedisConnected(function () {
      _getconn(key).get(key, function(error, result) {
        callback(error, result && result.length ? result : null);
      })
    });
  };
  /* }}} */

  /* {{{ public function set() */
  _me.set = function(key, value, callback, expire) {
    _AfterRedisConnected(function () {
      _getconn(key).setex(key, expire || 86400, value, function(error, result) {
        callback(error);
      })
    });
  };
  /* }}} */

  /* {{{ public function delete() */
  _me.delete = function(key, callback) {
    _me.set(key, '', callback);
  };
  /* }}} */

  return _me;
};
