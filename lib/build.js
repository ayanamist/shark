/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var fs  = require('fs'), os = require('os'), path = require('path');

/* {{{ public function properties() */
exports.properties  = function(file) {
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

/* {{{ public function mkdir() */
exports.mkdir   = function(dir) {
  if (!path.existsSync(dir)) {
    fs.mkdirSync(dir, 0755);
  }
};
/* }}} */
