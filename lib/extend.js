/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

/* {{{ public function clone() */
var clone = exports.clone = function(obj) {
  var _type = typeof(obj);
  if ('object' == _type && null !== obj) {
    var _me = Array.isArray(obj) ? [] : {};
    for (var i in obj) {
      _me[i] = clone(obj[i]);
    }
    return _me;
  }

  return obj;
}
/* }}} */

/* {{{ public function concat() */
/**
 * buffer concat
 */
var concat  = exports.concat = function() {

  var chunk = [];
  var total = 0;

  return {
    'push'  : function(data) {
      if (data instanceof Buffer) {
        chunk.push(data);
        total += data.length;
      }
    },
    'all'   : function() {
      if (0 == chunk.length) {
        return new Buffer(0);
      }

      if (1 == chunk.length) {
        return chunk[0];
      }

      var data  = new Buffer(total), pos = 0;
      chunk.forEach(function(item) {
          item.copy(data, pos);
          pos += item.length;
      });

      return data;
    },
  };
}
/* }}} */

/* {{{ public function escape() */
/**
 * 对字符串进行安全转义
 * @param {String} str
 * @param {String} charset, default utf-8
 * @return {String}
 */
var __escapemap = {
  '\''  : '\\\'',
  '"'   : '\\\"',
  '\\'  : '\\\\',
  '\0'  : '\\0',
  '\n'  : '\\n',
  '\r'  : '\\r',
  '\b'  : '\\b',
  '\t'  : '\\t',
  '\x1a': '\\Z',        /**<    EOF */
};
var escape  = exports.escape    = function(str) {
  if ('number' === (typeof str)) {
    return str;
  }

  var _char = [];
  for (var i = 0, m = str.length; i < m; i++) {
    var _me = str.charAt(i);
    if (__escapemap[_me]) {
      _me = __escapemap[_me];
    }
    _char.push(_me);
  }

  return _char.join('');
}
/* }}} */
