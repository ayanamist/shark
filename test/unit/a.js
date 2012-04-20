/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

// test coverage init, require all javascript files

/* {{{ private function fileset() */
function fileset(dir, callback) {
  var fs = require('fs');

  if (!fs.statSync(dir).isDirectory()) {
    callback(dir);
    return;
  }

  fs.readdirSync(dir).forEach(function(file) {
    if (file.indexOf('.svn') > -1 || /^\._/.test(file)) {
      return;
    }

    var _me = dir + '/' + file;
    if (fs.statSync(_me).isDirectory()) {
      fileset(_me, callback);
    } else {
      callback(_me);
    }
  });
}
/* }}} */

fileset(__dirname + '/../../lib', function(fname) {
  require(fname);
});

