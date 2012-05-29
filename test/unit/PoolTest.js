/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Pool    = require(__dirname + '/../../lib/pool.js');

describe('connection pool', function() {

  var connector = function() {
    return {
      'query' : function(callback) {
        setTimeout(callback, 2);
      },
  'close'   : function() {
  },
    }
  };

  /* {{{ should_pool_create_and_idle_works_fine() */
  it('should_pool_create_and_idle_works_fine', function(done) {
    var num = 6;
    var _me = Pool.create(connector, {
      'idle' : 100, 'size' : 4,
    });

    var beg = (new Date()).getTime();
    var ids = [];
    for (var i = 0; i < num; i++) {
      _me.get(function(who, id) {
        ids.push(id);
        who.query(function() {
          _me.free(id);
          if ((--num) == 0) {
            ids.should.eql([0,1,2,3,3,2]);
            setTimeout(function() {
              _me.get(function(who, id) {
                // XXX: 空闲超过100ms，断开重连
                id.should.eql(0);
                done();
              });
            }, 110);
          }
        });
      });
    }
  });
  /* }}} */

  /* {{{ should_pool_remove_works_fine() */
  it('should_pool_remove_works_fine', function(done) {
    var _me = Pool.create(connector, {'idle' : 300000, 'size' : 2});
    _me.get(function(me1, id1) {
      id1.should.eql(0);
      _me.get(function(me2, id2) {
        _me.free(id1);
        _me.free(id2);
        _me.remove(id2);        /**<    模拟有错误，断掉长连接  */
        _me.free(id2);
        _me.get(function(me3, id3) {
          id3.should.eql(0);
          _me.free(id3);
          done();
        });
      });
    });
  });
  /* ]}} */

});
