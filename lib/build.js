/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var fs  = require('fs'), path = require('path');

/* {{{ private function properties() */
var properties  = function(file) {
  var data  = {};

  try {
    fs.readFileSync(file, 'utf8').trim().split('\n').forEach(function(line) {
      var match = line.match(/^\s*(.*)\s*=\s*(.*)\s*$/);
      if (!match) {
        return;
      }

      data[match[1].trim()] = match[2].trim();
    });
  } catch (e) {
  }

  return data;
};
/* }}} */

exports.init    = function(file, root) {

  /**
   * @默认属性
   */
  var _defaults = properties(file);

  /**
   * @根路径
   */
  var _root = path.normalize(root ? root : __dirname + '/../');

  var _me   = {};

  /* {{{ public function valueOf() */
  _me.valueOf   = function (key) {
    return undefined !== _defaults[key] ? _defaults[key] : '$' + key;
  };
  /* }}} */

  /* {{{ public function makeconf() */
  /**
   * 通过模版生成配置文件
   *
   * @access public
   * @return void
   */
  _me.makeconf  = function (source, target, values) {
    values    = values || {};

    var _text = fs.readFileSync(_root + '/' + source, 'utf8');
    var match = _text.match(/##(.+?)##/g);
    if (match) {
      match.forEach(function(item) {
        var i = item.slice(2, item.length - 2);
        if (undefined !== values[i]) {
          _text   = _text.replace(item, values[i]);
        } else if (undefined !== _defaults[i]) {
          _text   = _text.replace(item, _defaults[i]);
        }
      });
    }

    fs.writeFileSync(_root + '/' + target, _text, 'utf8');
  };
  /* }}} */

  /* {{{ public function makedir() */
  _me.makedir   = function(dir) {
    if (!path.existsSync(dir)) {
      fs.mkdirSync(dir, 0755);
    }
  };
  /* }}} */

  return _me;
};

