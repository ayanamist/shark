/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var Memcached   = require('memcached');

exports.create  = function(servers, options) {

  /**
   * @机器列表
   */
  var _servers  = ['127.0.0.1:11211'];
  if (servers) {
    _servers    = Array.isArray(servers) ? servers : servers.split(',');
  }

  /**
   * @连接选项
   */
  var _options  = options || {};

  /**
   * @memcache对象
   */
  var _handle   = new Memcached(_servers, _options);

  var _me   = {};

  /* {{{ public function get() */
  /**
   * 从memcache获取数据
   *
   * @access public
   * @param {String} key
   * @param {Function} callback
   */
  _me.get   = function(key, callback) {
    _handle.get(key, function(err, res) {
      callback(err ? err : null, false === res ? null : res);
    });
  };
  /* }}} */

  /* {{{ public function set() */
  /**
   * 写入数据
   *
   * @access public
   * @param {String} key
   * @param {String} value
   * @param {Function} callback
   * @param {Integer} expire, optional, seconds
   */
  _me.set   = function(key, value, callback, expire) {
    _handle.set(key, value, expire || 86400, function(err, res) {
      callback(err, res);
    });
  };
  /* }}} */

  /* {{{ public function delete() */
  /**
   * 删除数据
   *
   * @access public
   * @param {String} key
   * @param {Function} callback
   */
  _me.delete    = function(key, callback) {
    _handle.del(key, function(err, res) {
      callback(err, err ? false : true);
    });
  };
  /* }}} */

  return _me;

};

