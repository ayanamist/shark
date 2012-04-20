/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

var should  = require('should');
var Build   = require(__dirname + '/../../lib/build.js');

describe('build library', function() {

  /* {{{ should_build_fileset_works_fine() */
  it('should_build_fileset_works_fine', function() {

    var _files  = [];
    Build.fileset(__dirname + '/../', function(fname) {
      _files.push(fname);
    });
    _files.should.include(__filename);

    try {
      var _files  = [];
      Build.fileset(__dirname + '/i_am_not_exist', function(fname) {
        _files.push(fname);
      });
    } catch (e) {
    }
    _files.should.eql([]);
  });
  /* }}} */

  /* {{{ should_build_setmode_works_fine() */
  it('should_build_setmode_works_fine', function() {
    //Build.setmode(__filename, 0111);
  });
  /* }}} */

  /* {{{ should_build_init_works_fine() */
  it('should_build_init_works_fine', function() {
    var _me = Build.init();
  });
  /* }}} */

});
