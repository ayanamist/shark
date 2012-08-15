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
  var _options  = {
    'timeout' : 50,
  };
  for (var i in options) {
    _options[i] = options[i];
  }
  if (!_options.connect_timeout) {
    _options.connect_timeout = _options.timeout;
  }

  /**
   * @连接对象
   */
  var _handles  = {};

  /**
   * @对象key
   */
  var _handkey  = [];

  /**
   * @连接计数器
   */
  var _connnum  = 0;

  /**
   * @请求队列
   */
  var _queue = require(__dirname + '/queue.js').create(_options);
  var _AfterRedisConnected = function (callback, onerr) {
    if (_handkey.length < 1) {
      _queue.push(callback, onerr);
    } else {
      callback();
    }
  };

  /**
   * @连接函数
   */
  var _connect  = function (item) {
    var _conn;
    var _me = item.split(':');

    if (_me.length > 1) {
      _conn = Redis.createClient(_me[1], _me[0], _options);
    } else {
      _conn = Redis.createClient(item, _options);
    }

    _conn.removeAllListeners('error');
    _conn.on('error', function (error) {
      require(__dirname + '/log.js').exception(error);
    });
    _conn.once('ready', function () {
      var p = (_connnum++);
      _handles[p] = _conn;
      _handkey  = Object.keys(_handles);

      _conn.on('error', function (error) {
        delete _handles[p];
        _handkey  = Object.keys(_handles);
        setTimeout(function () {
          _connect(item);
        }, 100);
      });

      var c;
      while (c = _queue.shift()) {
        c();
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
    idx = _handkey[Math.abs(idx) % _handkey.length];

    return _handles[idx];
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
    }, callback);
  };
  /* }}} */

  /* {{{ public function set() */
  _me.set = function(key, value, callback, expire) {
    _AfterRedisConnected(function () {
      _getconn(key).setex(key, expire || 86400, value, function(error, result) {
        callback(error);
      })
    }, callback);
  };
  /* }}} */

  /* {{{ public function delete() */
  _me.delete = function(key, callback) {
    _me.set(key, '', callback);
  };
  /* }}} */

  return _me;
};
