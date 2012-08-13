/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.create  = function(options) {

  /**
   * @队列对象
   */
  var __slots   = {};

  /**
   * @访问顺序
   */
  var __orders  = [];

  /**
   * @队列属性
   */
  var _options = {
    'timeout'   : 0,        /**<    超时时间(ms)    */
    'maxitem'   : 0,        /**<    最大记录数      */
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  var _me = {};

  /* {{{ public function push() */
  _me.push = function(o, p) {
    p = p && + p | 0 || 0;
    if (p < 0) {
      p = 0;
    }
    if (!__slots[p]) {
      __slots[p] = [];
      __orders = null;
    }
    var i = __slots[p].push({
      'o' : o,
      's' : 0,
    });
    if (_options.timeout) {
      __slots[p][i - 1].t = setTimeout(function () {
        __slots[p][i - 1].s = 1;
      }, _options.timeout);
    }

    return _me;
  };
  /* }}} */

  /* {{{ public function size() */
  _me.size = function(idx) {
    if (undefined != idx) {
      return __slots[idx] ? __slots[idx].length : 0;
    }

    var size  = 0;
    for (var idx in __slots) {
      size += __slots[idx].length;
    }

    return size;
  };
  /* }}} */

  /* {{{ public function fetch() */
  _me.fetch = function() {
    if (null === __orders) {
      var tmp = [];
      for (var idx in __slots) {
        tmp.push(idx);
      }
      __orders = tmp.sort(function(a, b) {
        return a - b;
      });
    }

    for (var i = 0; i < __orders.length; i++) {
      var idx = __orders[i];
      while (__slots[idx] && __slots[idx].length) {
        var the = __slots[idx].shift();
        if (the.s > 0) {
          continue;
        }

        the.t && clearTimeout(the.t);

        return the.o;
      }
    }
    __orders = null;

    return null;
  };
  /* }}} */

  return _me;

}
/* }}} */

