/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

exports.create  = function(fn, options) {

  /**
   * @构造器
   */
  var _creator  = fn;

  /**
   * @配置属性
   */
  var _options  = {
    'min'   : 4,            /**<    最小池大小  */
    'max'   : 10,           /**<    最大池大小  */
    'idle'  : 30000,        /**<    空闲时间    */
  };

  /**
   * @对象列表
   */
  var _objects  = [];

  /**
   * @被占用的ID
   */
  var _queque   = [];

  /**
   * @调用请求
   */
  var _callback = [];

  /**
   * @空闲检查定时器
   */
  var _timer    = null;

  var _me   = {};

  /* {{{ public function get() */
  /**
   * 获取一个资源
   *
   * @access public
   */
  _me.get   = function(callback) {
  };
  /* }}} */

  /* {{{ public function free() */
  /**
   * 释放被锁定的资源
   *
   * @access public
   */
  _me.free  = function(id) {
    _queque.unshift(id);
  };
  /* }}} */

  return _me;

};
