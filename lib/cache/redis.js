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
  _servers.forEach(function(item) {
    var _me = item.split(':');
    if (_me.length > 1) {
      var _conn = Redis.createClient(_me[1], _me[0], _options);
    } else {
      var _conn = Redis.createClient(item, _options);
    }

    _handles.push(_conn);
  });

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
  var _cache    = {};

  /* {{{ public function set() */
  _cache.get    = function(key, callback) {
    _getconn(key).get(key, function(error, result) {
      callback(error, result && result.length ? result : null);
    });
  };
  /* }}} */

  /* {{{ public function set() */
  _cache.set    = function(key, value, callback, expire) {
    _getconn(key).set(key, value, function(error, result) {
      callback(error);
    });
  };
  /* }}} */

  /* {{{ public function delete() */
  _cache.delete = function(key, callback) {
    _cache.set(key, '', callback);
  };
  /* }}} */

  return _cache;
};
