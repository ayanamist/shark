/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var Zlib    = require('zlib');

var MAX_VALUE_SIZE  = 4096;

/**
 * 获取当前时间
 */
var timestamp   = function() {
  return (new Date()).getTime();
};

/**
 * 数据序列化
 */
var serialize   = function(value, callback) {
  compress(JSON.stringify(value), callback);
};

/**
 * 反序列化
 */
var unserialize = function(value, callback) {
  uncompress(value, function(buf) {
    callback(null, JSON.parse(buf));
  });
};

/**
 * 数据压缩
 */
var compress    = function(value, callback) {
  if (value.length < MAX_VALUE_SIZE) {
    callback(null, '0' + value);
    return;
  }

  Zlib.gzip(value, function(buf) {
    console.log(buf);
  });
};

/**
 * 数据解压
 */
var uncompress  = function(value, callback) {
  callback(value.slice(1));
  return;
  Zlib.gunzip(value, function(buf) {
    console.log(buf);
  });
};

/* {{{ exports getkey() */
/**
 * 构造key
 */
var cacheindex  = function(key) {

  key   = (key instanceof Buffer) ? key : new Buffer(key);

  var hash1 = 5381;
  var hash2 = 0;
  for (var i = 0, len = key.length; i < len; i++) {
    hash1   = (hash1 << 5 + hash1) + key[i];
    hash2   = (hash2 << 4) ^ (hash2 >> 28) ^ key[i];
  }

  return ([hash1, hash2]).join(':');
};
exports.getkey  = cacheindex;
/* }}} */

/* {{{ function MemoryStore() */
/**
 * 数据存储在内存中
 */
var MemoryStore = function(size) {

  var _pool = require(__dirname + '/mstack.js').create(size || 2000);

  var _me   = {};

  _me.set   = function(key, value, callback) {
    _pool.set(key, value);
    callback(null);
  };

  _me.get   = function(key, callback) {
    callback(null, _pool.get(key));
  };

  _me.delete    = function(key, callback) {
    // XXX: delete
    callback(null);
  };

  return _me;
};
/* }}} */

var __instances = {};
exports.create  = function(name, store, keeper) {

  name  = name.trim().toLowerCase();
  if (undefined !== __instances[name]) {
    return __instances[name];
  }

  /**
   * @缓存存储引擎
   */
  var _res  = store || MemoryStore();

  /**
   * @Tag同步引擎
   */
  var _sync = keeper;

  /**
   * @Tag数据更新时间
   */
  var _tags = {};
  var sync_tag_info = function() {
    if (!_sync) {
      return;
    }
  };

  var _me   = __instances[name] = {};

  /* {{{ public function set() */
  /**
   * Set cache value
   *
   * @param {String} key
   * @param {Object} value
   * @param {Function} callback
   * @param {Integer} expire
   * @param {Array} tags
   */
  _me.set   = function(key, value, callback, expire, tags) {
    var now = timestamp();
    var obj = {
      'i'   : now,                                  /**<    数据写入时间    */
      'e'   : now + (expire || 86400000),           /**<    数据过期时间    */
      'k'   : key,                                  /**<    数据key         */
      'v'   : value,                                /**<    数据值          */
      't'   : tags ? (Array.isArray(tags) ? tags : [tags]) : [],
    };
    serialize(obj, function(error, buf) {
      if (error) {
        callback(error, null);
      } else {
        _res.set(cacheindex(name + '#' + key), buf, callback);
      }
    });
  };
  /* }}} */

  /* {{{ public function get() */
  _me.get   = function(key, callback) {
    var now = timestamp();
    _res.get(cacheindex(name + '#' + key), function(error, value) {
      if (error || !value) {
        callback(error, null);
        return;
      }

      unserialize(value, function(error, value) {
        if (error) {
          callback(error, null);
          return;
        }
        if (!value.i || !value.e || !value.k || undefined === value.v) {
          callback(new Error('UnExpectCacheValue'));
          return;
        }

        /**
         * @time expire or key does not match
         */
        if (value.e < now || value.k != key) {
          callback(null, null);
          return;
        };

        /**
         * @tag expire
         */
        var _list = Array.isArray(value.t) ? value.t : [];
        var _len  = _list.unshift('__global__');
        for (var i = 0; i < _len; i++) {
          var idx = _list[i];
          if (_tags[idx] && value.i < _tags[idx]) {
            callback(null, null);
            return;
          }
        }

        callback(null, value.v, value.e - value.i);
      });
    });
  };
  /* }}} */

  /* {{{ public function unset() */
  _me.unset = function(key, callback) {
    _res.delete(cacheindex(name + '#' + key), callback);
  };
  /* }}} */

  /* {{{ public function tagrm() */
  /**
   * 根据tag删除缓存
   */
  _me.tagrm = function(tag) {
    _tags[tag ? tag.trim() : '__global__'] = timestamp();
    sync_tag_info();
  };
  /* }}} */

  return _me;
}
