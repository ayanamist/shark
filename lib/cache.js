/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var MAX_INDEX_SIZE  = 256;
var MAX_VALUE_SIZE  = 4096;

var timestamp   = function() {
  return (new Date()).getTime();
};

/**
 * 数据序列化
 */
var serialize   = function(value) {
  var value = JSON.stringify(value);
  if (value.length >= MAX_VALUE_SIZE) {
    value   = '1' + compress(value);
  } else {
    value   = '0' + value;
  }

  return value;
};

/**
 * 反序列化
 */
var unserialize = function(value) {
  if ('1' === value.charAt(0)) {
    value   = uncompress(value.slice(1));
  } else {
    value   = value.slice(1);
  }

  return JSON.parse(value);
};

/**
 * 数据压缩
 */
var compress    = function(value) {
  return value;
};

/**
 * 数据解压
 */
var uncompress  = function(value) {
  return value;
};

/**
 * 构造key
 */
var buildkey    = function(key) {
  //
  if (key.length > MAX_INDEX_SIZE) {
  }

  return key;
};

exports.create  = function(name, handle) {

  /**
   * @Tag数据更新时间
   */
  var _tags = {};

  var sync_tag_info = function() {
  };

  /**
   * @存储引擎
   */
  var _res  = handle;

  var _me   = {};

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
    _res.set(buildkey(name + '#' + key), serialize(obj), callback);
  };
  /* }}} */

  /* {{{ public function get() */
  _me.get   = function(key, callback) {
    var now = timestamp();
    _res.get(buildkey(name + '#' + key), function(error, value) {
      if (error || !value) {
        callback(error, null);
        return;
      }

      try {
        value = unserialize(value);
        if (!value.i || !value.e || !value.k || undefined === value.v) {
          throw new Error('UnExpectCacheValue');
        }
      } catch (e) {
        callback(e, null);
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
  };
  /* }}} */

  /* {{{ public function unset() */
  _me.unset = function(key, callback) {
    _res.delete(buildkey(name + '#' + key), callback);
  };
  /* }}} */

  /* {{{ public function tagrm() */
  /**
   * 根据tag删除缓存
   */
  _me.tagrm = function(tag) {
    _tags[tag ? tag.trim() : '__global__'] = timestamp();
  };
  /* }}} */

  return _me;
}
