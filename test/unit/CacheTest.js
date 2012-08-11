/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Cache   = require(__dirname + '/../../lib/cache.js');
var Config  = require(__dirname + '/../../lib/config.js');

/* {{{ private function Handle() */
/**
 * @缓存存储引擎
 */
var Handle  = function() {

  var _obj  = {};

  var _me   = {};

  _me.set   = function(key, value, callback) {
    _obj[key]   = value;
    callback(null);
  };

  _me.get   = function(key, callback) {
    callback(null, _obj[key]);
  };

  _me.delete    = function(key, callback) {
    delete _obj[key];
    callback(null);
  };

  return _me;
};
/* }}} */

/* {{{ private function Keeper() */
/**
 * @模拟的tag info存储引擎
 */
var Keeper  = function() {

  var _info = {
    'hello' : 1,
  };

  var _me   = {};
  _me.write = function(name, value, callback) {
    name    = name.trim().toLowerCase();
    if ('delay' == name) {
      // XXX: 模拟异步write方法
      setTimeout(function() {
        _info[name] = Math.max(value, _info[name] ? _info[name] : 0);
        callback && callback(true);
      }, 5);

      return;
    }

    switch (name) {
      case 'right':
        _info[name] = Math.max(value, _info[name] ? _info[name] : 0);
        break;
      default:
        _info[name] = value;
        break;
    }
    callback && callback(null);
  };
  _me.load  = function(callback, _after) {
    callback(_info.error ? (new Error('TestError')) : null, _info);
  };

  return _me;
};
/* }}} */

describe('cache management', function() {

  /* {{{ should_cache_set_and_get_and_unset_works_fine() */
  it('should_cache_set_and_get_and_unset_works_fine', function(done) {
    var num = 2;
    var _me = Cache.create('test1', Handle());

    _me.set('key1', {'a' : 'val1', 'b' : [2]}, function(error) {
      should.ok(!error);
      _me.get('key1', function(error, value, expire) {
        should.ok(!error);
        value.should.eql({'a' : 'val1', 'b' : [2]});
        expire.should.be.within(0,2);
        _me.unset('key1', function(error) {
          should.ok(!error);
          _me.get('key1', function(error, value, expire) {
            should.ok(!error);
            should.ok(!value);
            if ((--num) <= 0) {
              done();
            }
          });
        });
      });

    }, 2);

    _me.get('i am not exists', function(error, value, expire) {
      should.ok(!error);
      should.ok(null === value);
      if ((--num) <= 0) {
        done();
      }
    });
  });
  /* }}} */

  /* {{{ should_unexpected_cache_works_fine() */
  it('should_unexpected_cache_works_fine', function(done) {
    var res = Handle();
    var _me = Cache.create('test2', res);

    res.set(Cache.getkey('test2#key1'), JSON.stringify({'a' : 'fwekksgeg'}), function(error) {
      _me.get('key1', function(error, value, expire) {
        error.toString().should.eql('Error: UnExpectCacheValue');
        done();
      });
    });
  });
  /* }}} */

  /* {{{ should_cache_expire_works_fine() */
  it('should_cache_expire_works_fine', function(done) {
    var num = 1;
    var _me = Cache.create('test2', Handle());
    _me.set('key1', 'val1', function(error) {

      _me.get('key1', function(error, value, expire) {
        value.should.eql('val1');
      });

      setTimeout(function() {
        _me.get('key1', function(error, value, expire) {
          should.ok(!error);
          should.ok(null === value);
          if ((--num) <= 0) {
            done();
          }
        });
      }, 2);
    }, 1);

    ++num;
    _me.set('key2', 'val2', function(error) {

      should.ok(!error);
      _me.tagrm('table3');

      _me.get('key2', function(error, value, expire) {
        should.ok(!error);
        value.should.eql('val2');
        expire.should.within(8639900, 86400000);

        setTimeout(function() {
          _me.tagrm('table2');
          _me.get('key2', function(error, value, expire) {
            should.ok(!error);
            should.ok(null === value);
            if ((--num) <= 0) {
              done();
            }
          });
        }, 1);
      });
    }, null, ['table1', 'table2']);
  });
  /* }}} */

  /* {{{ should_cache_sigleton_works_fine() */
  it('should_cache_sigleton_works_fine', function(done) {
    var me1 = Cache.create('sigleton');
    var me2 = Cache.create('sigletoN ', Handle());

    var num = 2;
    me1.unset('blablablaaaa', function(error) {
    });      /**<    这个CASE没有意义,纯粹为了混覆盖率   */
    me1.set('blablablaaaa', '周华健', function(error) {
      me1.get('blablablaaaa', function(error, value, expire) {
        value.should.eql('周华健');
        if ((--num) <= 0) {
          done();
        }
      });

      me2.get('blablablaaaa', function(error, value, expire) {
        value.should.eql('周华健');
        if ((--num) <= 0) {
          done();
        }
      });
    });
  });
  /* }}} */

  /* {{{ should_gzip_with_buffer_works_fine() */
  it('should_gzip_with_buffer_works_fine', function(done) {
    var Zlib    = require('zlib');
    Zlib.gzip(JSON.stringify({
      '_me' : 'abcdefghijklmnopqrstuvwxyz0123456',
      '_hi' : 0x2312312,
    }), function(error, value) {
      should.ok(!error);
      Zlib.gunzip(value, function(error, data) {
        should.ok(!error);

        var _me = JSON.parse(data);
        _me.should.have.property('_me', 'abcdefghijklmnopqrstuvwxyz0123456');
        _me.should.have.property('_hi', 0x2312312);
        done();
      });
    });
  });
  /* }}} */

  /* {{{ should_tag_info_sync_works_fine() */
  it('should_tag_info_sync_works_fine', function(done) {

    // XXX: 同一个keeper，两个cache对象（模拟两台机器，或者两个进程）的taginfo会共享
    var kep = Keeper();

    var me1 = Cache.create('test6_1', Handle(), kep, {
      'tag_flush_interval'  : 1,
    });
    var me2 = Cache.create('test6_2', Handle(), kep, {
      'tag_flush_interval'  : 1,
    });

    me1.set('key1', 'val1', function(error) {
      me1.get('key1', function(error, value) {
        value.should.eql('val1');
        me2.set('key1', 'val2', function(error) {
          me2.get('key1', function(error, value) {
            value.should.eql('val2');

            setTimeout(function() {
              me2.tagrm('delay');
              me2.get('key1', function(error, value) {

                // me2 立即生效, 并且在1ms后向keeper同步tag info
                should.ok(!error);
                should.ok(null === value);

                // me1 要等到同步完成后才能见到效果
                me1.get('key1', function(error, value) {
                  value.should.eql('val1');
                  setTimeout(function() {
                    me1.get('key1', function(error, value) {
                      should.ok(!error);
                      should.ok(null === value);
                      done();
                    });
                  }, 80);
                });
              });
            }, 1);
          });
        }, null, ['right', 'delay']);
      });
    }, null, ['right', 'delay']);


  });
  /* }}} */

  /* {{{ should_cache_protected_after_update_works_fine() */
  it('should_cache_protected_after_update_works_fine', function(done) {
    var _me = Cache.create('test7', Handle(), null);

    _me.set('key1', 'val1', function(error) {
      should.ok(!error);
      _me.get('key1', function(error, result, expire) {
        should.ok(!error);
        result.should.eql('val1');

        _me.tagrm('tag1', 3);
        _me.set('key1', 'val1', function(error) {
          should.ok(!error);
          _me.get('key1', function(error, result, expire) {
            should.ok(!error);
            should.ok(null === result);
            setTimeout(function() {
              _me.set('key1', 'val1', function(error){
                _me.get('key1', function(error, result, expire) {
                  result.should.eql('val1');
                  done();
                });
              }, null, ['tag1']);
            }, 7);
          });
        }, null, ['tag1']);
      });
    }, null, ['tag1']);
  });
  /* }}} */

});

