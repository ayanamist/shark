/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');

describe('error interface', function () {

  var iError  = require(__dirname + '/../../lib/error.js');

  /* {{{ should_error_have_name_property() */
  it('should_error_have_name_property', function () {
    var _me = new iError('Hello ', 'i am only test error');
    _me.should.have.property('name', 'Hello');
    _me.should.have.property('message', 'i am only test error');
  });
  /* }}} */

  /* {{{ should_get_error_stack_works_fine() */
  it('should_get_error_stack_works_fine', function () {
    try {
        throw new iError(' Hloo', 'error message');
    } catch (e) {
      e.stack.should.include('Hloo: error message');
      e.stack.should.include('at new <anonymous> (');
    }
  });
  /* }}} */

});
