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
    'size'  : 10,           /**<    最大连接数  */
    'idle'  : 30000,        /**<    空闲时间    */
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
      '_me' : _creator(),
      'use' : 0,
    }) - 1);
  };
  /* }}} */

  /**
   * @调用请求
   */
  /* {{{ _execute() */
  var _callback = [];
  var _execute  = function() {
    while (_callback.length && _stacks.length) {
      var cb = _callback.shift();
      var id = _stacks.pop();
      cb(_objects[id]._me, id);
      _objects[id].use  = 1;
      _objects[id]._up  = (new Date()).getTime();
      delete cb;
    }
    if (_callback.length) {
      process.nextTick(_execute);
    }
  };
  /* }}} */

  /**
   * @空闲检查定时器
   */
  /* {{{ _timer */
  var _timer    = setInterval(function() {
    var now = (new Date()).getTime() - _options.idle;
    var ids = [];
    var obj = [];
    _objects.forEach(function(item) {
      if (item._up >= now || item.use > 0) {
        ids.push(obj.push(item) - 1);
        return;
      }

      if (item._me.close && 'function' === (typeof item._me.close)) {
        item._me.close();
      }
    });
    _objects= obj;
    _stacks = ids;
  }, Math.ceil(_options.idle / 10));
  /* }}} */

  var _me   = {};

  /* {{{ public function get() */
  /**
   * 获取一个资源
   *
   * @access public
   */
  _me.get   = function(callback) {
    if (!_stacks.length && _objects.length < _options.size) {
      _connect();
    }

    if (_stacks.length) {
      var id = _stacks.pop();
      callback(_objects[id]._me, id);
      _objects[id].use  = 1;
      _objects[id]._up  = (new Date()).getTime();
    } else {
      _callback.push(callback);
      process.nextTick(_execute);
    }
  };
  /* }}} */

  /* {{{ public function free() */
  /**
   * 释放被锁定的资源
   *
   * @access public
   */
  _me.free  = function(id) {
    if (_objects[id]) {
      _objects[id].use  = 0;
      _stacks.push(id);
    }
  };
  /* }}} */

  return _me;

};
