/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

var should  = require('should');
var Query	= require(__dirname + '/../../app/rest/query.js');

describe('itier query class', function() {

  /* {{{ should_simple_select_works_fine() */
  /**
   * XXX: this is only a demo test case
   */
	it('should_simple_select_works_fine', function(done) {
		var sql	= 'SELECT * FROM table1 WHERE c1 = :c';
		var val	= {
			'c'	: "i'm aleafs",
		};
    var opt	= {
      'debug'   : 0,
      'cache'   : 3,
		};

		Query.query(sql, val, opt, function(error, data, info, debug) {
      should.ok(!error);
      data.should.eql([['c1', 'c2', 'c3'],[1,2,3],[4,5,6]]);
      info.should.have.property('expire');
      debug.should.eql([]);
			done();
		});
	});
	/* }}} */

});

