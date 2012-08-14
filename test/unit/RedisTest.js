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

  /* {{{ should_redis_works_fine_when_servers_not_works() */
  it('should_redis_works_fine_when_servers_not_works', function (done) {

    var _fake   = require('netblackhole').create(10241);
    var _conf   = Config.create(__dirname + '/etc/redis.ini');
    var redis   = Redis.create(_conf.get('servers') + ',localhost:10241', {
      'timeout' : 10,
    });

    redis.set('key1', 'val1', function (error, result) {
      should.ok(!error);
      setTimeout(function () {
        var msg = _fake.msgs().pop();
        msg.should.have.property('evt', 'data');
        _fake.close();
        done();
      }, 20);
    });
  });
  /* }}} */

  /* {{{ should_redis_queue_timeout_works_fine() */
  it('should_redis_queue_timeout_works_fine', function (done) {
    var _fake   = require('netblackhole').create(10241);
    var redis   = Redis.create('localhost:10241', {
      'timeout' : 10,
    });

    redis.set('key1', 'should timeout', function (error) {
      error.should.have.property('name', 'QueuedTimeout');
      setTimeout(function () {
        _fake.close();
        done();
      }, 5);
    });

  });
  /* }}} */

});

