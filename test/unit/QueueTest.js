/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Queque	= require(__dirname + '/../../lib/queue.js');

describe('priority queque', function() {

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
