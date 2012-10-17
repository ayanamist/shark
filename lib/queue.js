/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var _extend = function (a, b) {
  for (var i in b) {
    a[i] = b[i];
  }
  return a;
};

var _error = function (name, message) {
  var o = new Error(message);
  o.name = name;
  return o;
};

exports.create = function (options) {

  /**
   * @队列属性
   */
  var _options = _extend({
    'timeout'   : 0,        /**<    超时时间(ms)    */
    'maxitem'   : 0,        /**<    最大记录数      */
  }, options);


  /**
   * @对象栈
   */
  var _queues = [];

  var _me = {};

  _me.size = function () {
    return _queues.length;
  };

  /* {{{ public function push() */
  /**
   * push an item to queue
   *
   * @access public
   * @param {Object} o
   * @param {Function} onerr
   */
  _me.push = function (o, onerr) {
    var idx = _queues.length;
    if (_options.maxitem && idx >= _options.maxitem) {
      onerr && onerr(_error('QueueIsFull', 'Already ' + idx + ' items in the queue.'), o);
      return;
    }

    _queues.push({
      'o' : o,
      's' : 0,
    });
    if (_options.timeout && onerr) {
      (function () {
        var m = _queues[idx];
        m.t = setTimeout(function () {
          m.s = 1;
          var pos = _queues.indexOf(m);
          if (pos >= 0) {
            _queues.splice(pos, 1);  
          }

          onerr(_error('QueuedTimeout', 'Item queued timeout after ' + _options.timeout + 'ms.'), o);
        }, _options.timeout);
      })();
    }

    return _me;
  };
  /* }}} */

  /* {{{ public function shift() */
  /**
   * to get an item from the head
   *
   * @access public
   */
  _me.shift = function () {
    var obj;
    while (_queues.length) {
      obj = _queues.shift();
      obj.t && clearTimeout(obj.t);
      if (obj.s < 1) {
        return obj.o;
      }
    }

    return null;
  };
  /* }}} */

  return _me;
};

exports.createPriorityQueue = function(options) {

  /**
   * @队列对象
   */
  var slots = {};

  /**
   * @访问顺序
   */
  var order = [];

  var _me = {};

  _me.size  = function (p) {
    if (undefined !== p && null !== p) {
      return slots[p] ? slots[p].size() : 0;
    }

    var n = 0;
    for (var i in slots) {
      n += slots[i].size();
    }

    return n;
  };

  _me.push  = function (o, p, onerr) {
    p = Math.max(0, p && + p | 0 || 0);
    if (!slots[p]) {
      slots[p] = exports.create(options);
      order = Object.keys(slots).sort(function (a, b) {
        return a - b;
      });
    }
    slots[p].push(o, onerr);

    return _me;
  };

  _me.shift = function () {
    for (var i = 0, m = order.length; i < m; i++) {
      var s = slots[order[i]];
      if (s.size()) {
        return s.shift();
      }
    }
    return null;
  };

  return _me;

}
/* }}} */

