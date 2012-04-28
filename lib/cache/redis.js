/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var Redis   = require('redis');

exports.create  = function(servers, options) {

  var _cache    = {};

  /* {{{ public function set() */
  _cache.get    = function(key, callback) {
  };
  /* }}} */

  /* {{{ public function set() */
  _cache.set    = function(key, value, callback, expire) {
  };
  /* }}} */

  /* {{{ public function delete() */
  _cache.delete = function(key, callback) {
  };
  /* }}} */

  return _cache;
};
