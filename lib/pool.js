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
  /* {{{ _options */
  var _options  = {
    'min'   : 4,            /**<    最小池大小  */
    'max'   : 10,           /**<    最大池大小  */
    'idle'  : 30000,        /**<    空闲时间    */
    'lock'  : true,
  };
  for (var i in options) {
    _options[i] = options[i];
  }
  /* }}} */

  /**
   * @对象列表
   */
  /* {{{ _objects */
  /**
   * @被占用的ID
   */
  var _stacks   = [];
  var _objects  = [];

  var _connect  = function() {
    _stacks.push(_objects.push({
      '_up' : (new Date).getTime(),
      '_me' : _creator()
    }) - 1);
  };
  for (var i = 0; i < _options.min; i++) {
    _connect();
  }
  /* }}} */

  /**
   * @调用请求
   */
  var _callback = [];
  var _execute  = function() {
    while (_callback.length && _stacks.length) {
      var cb = _callback.shift();
      var id = _stacks.pop();
      cb(_objects[id]._me, id);
      _objects[id]._up  = (new Date()).getTime();
      delete cb;
    }
    if (_callback.length) {
      process.nextTick(_execute);
    }
  };

  /**
   * @空闲检查定时器
   */
  var _timer    = null;
  if (_options.max > _options.min && _options.lock) {
    _timer  = setInterval(function() {
      var idle  = (new Date()).getTime() - _options.idle;
      _objects.forEach(function(item, key) {
        if (item._up < idle) {
          // xxx:
        }
      });
    }, Math.ceil(_options.idle / 10));
  }

  var _me   = {};

  /* {{{ public function get() */
  /**
   * 获取一个资源
   *
   * @access public
   */
  _me.get   = function(callback) {
    if (_objects.length < _options.max) {
      _connect();
    }
    _callback.push(callback);
    process.nextTick(_execute);
  };
  /* }}} */

  /* {{{ public function free() */
  /**
   * 释放被锁定的资源
   *
   * @access public
   */
  _me.free  = function(id) {
    _stacks.push(id);
  };
  /* }}} */

  return _me;

};
