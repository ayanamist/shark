/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Config  = require(__dirname + '/../../lib/config.js');
var Redis   = require(__dirname + '/../../lib/redis.js');

describe('redis cache test', function() {


  /* {{{ should_redis_set_get_delete_works_fine() */
  it('should_redis_set_get_delete_works_fine', function(done) {
    var _conf   = Config.create(__dirname + '/etc/redis.ini');
    var _cache  = Redis.create(_conf.get('servers'), _conf.get('options'));

    var _times  = 0;

    _times++;
    _cache.delete('i_am_not_exists', function(error) {
      should.ok(!error);
      _cache.get('i_am_not_exists', function(error, result) {
        should.ok(!error);
        if ((--_times) <= 0) {
          done();
        }
      });
    });

    _times++;
    _cache.set('key1', 'val1', function(error, result) {
      _cache.set('key1', 'val2', function(error, result) {
        should.ok(!error);
        _cache.get('key1', function(error, result) {
          should.ok(!error);
          result.should.eql('val2');
          if ((--_times) <= 0) {
            done();
          }
        });
      });
    });

    _times++;
    _cache.set('key2', 0x1234, function(error, result) {
      should.ok(!error);
      _cache.get('key2', function(error, result) {
        should.ok(!error);
        result.should.eql(0x1234 + '');
        _cache.delete('key2', function(error, result) {
          should.ok(!error);
          _cache.get('key2', function(error, result) {
            should.ok(!error);
            should.ok(null === result);
            if ((--_times) <= 0) {
              done();
            }
          });
        });
      });
    });
  });
  /* }}} */

  /* {{{ should_redis_set_binary_works_fine() */
  it('should_redis_set_binary_works_fine', function(done) {
    var _conf   = Config.create(__dirname + '/etc/redis.ini');
    var _cache  = Redis.create(_conf.get('servers'), _conf.get('options'));

    _cache.set('key1', new Buffer('abc周华健'), function(error, result) {
      should.ok(!error);
      _cache.get('key1', function(error, result) {
        should.ok(!error);
        result.toString().should.eql('abc周华健');
        done();
      });
    });
  });
  /* }}} */

  /* {{{ should_multibyte_data_works_fine() */
  it('should_multibyte_data_works_fine', function(done) {
    var _conf   = Config.create(__dirname + '/etc/redis.ini');
    var _cache  = Redis.create(_conf.get('servers'), _conf.get('options'));
    var message = '';

    while (message.length < 1024 * 65) {
      message += '周华健';
    }

    _cache.set('key1', message, function(error, result) {
      should.ok(!error);
      _cache.get('key1', function(error, result) {
        should.ok(!error);
        result.should.eql(message);
        done();
      });
    });
  });
  /* }}} */

});

