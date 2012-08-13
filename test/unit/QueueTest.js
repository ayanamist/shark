/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Events  = require(__dirname + '/../../lib/events.js');
var Queque	= require(__dirname + '/../../lib/queue.js');

describe('simple queue', function () {

  /* {{{ should_simple_queue_push_and_shift_works_fine() */
  it('should_simple_queue_push_and_shift_works_fine', function () {

    var _me = Queque.create({
      'maxitem' : 2
    });

    should.ok(!_me.shift());
    _me.size().should.eql(0);

    _me.push(1);
    _me.push(2);
    _me.push(3);
    _me.push(4, function (error) {
      error.should.have.property('name', 'QueueIsFull');
      error.stack.should.include('Already 2 items in the queue.');
    });

    _me.shift().should.eql(1);
    _me.push('5');
    _me.shift().should.eql(2);
    _me.shift().should.eql('5');

    should.ok(!_me.shift());
    _me.size().should.eql(0);
  });
  /* }}} */

  /* {{{ should_simple_queue_timeout_works_fine() */
  it('should_simple_queue_timeout_works_fine', function (done) {

    var evt = Events.create(function () {
      done();
    });

    var _me = Queque.create({
      'timeout' : 4,
    });

    evt.wait('fetched', function () {
      _me.push(1, function (error) {
        should.ok(!error);
      });
      process.nextTick(function () {
        _me.shift().should.eql(1);
        evt.emit('fetched');
      });
    });

    evt.wait('timeout', function () {
      _me.push(2, function (error, item) {
        error.should.have.property('name', 'QueuedTimeout');
        error.stack.should.include('Item queued timeout after 4ms.');
        item.should.eql(2);
        should.ok(!_me.shift());
        evt.emit('timeout');
      });
    });

  });
  /* }}} */

});

xdescribe('priority queque', function() {

  /* {{{ should_queque_push_and_fetch_works_fine() */
  it('should_queque_push_and_fetch_works_fine', function() {
    var queque	= Queque.create({'o' : '暂时都没啥用'});
    queque.size().should.eql(0);
    should.ok(!queque.fetch());

    queque.push('a', 1);
    queque.size().should.eql(1);
    queque.push('b', 0);
    queque.push('c', 10);
    queque.push('d', -1);
    queque.size().should.eql(4);
    queque.size(0).should.eql(2);

    queque.fetch().should.eql('b');
    queque.fetch().should.eql('d');
    queque.fetch().should.eql('a');
    queque.fetch().should.eql('c');
    should.ok(!queque.fetch());

    queque.size().should.eql(0);
  });
  /* }}} */

});
