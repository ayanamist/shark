/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

var should  = require('should');
var Pool    = require(__dirname + '/../../lib/pool.js');

describe('connection pool', function() {

  var connector = function() {
    return {
      'query' : function(callback) {
        setTimeout(callback, 2);
      },
    }
  };

  /* {{{ should_pool_create_works_fine() */
  it('should_pool_create_works_fine', function(done) {
    var num = 6;
    var _me = Pool.create(connector, {
      'idle' : 10, 'min' : 2, 'max' : 4,
    });

    var ids = [];
    for (var i = 0; i < num; i++) {
      _me.get(function(who, id) {
        who.query(function() {
          ids.push(id);
          _me.free(id);
          if ((--num) == 0) {
            ids.should.eql([3,2,1,0,0,1]);
            done();
          }
        });
      });
    }
  });
  /* }}} */

});
