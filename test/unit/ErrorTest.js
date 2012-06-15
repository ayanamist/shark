/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');

describe('error interface', function () {

  var iError  = require(__dirname + '/../../lib/error.js');

  it('should', function () {
    var _me = new iError('Hello ', 'i am only test error');
    _me.should.have.property('name', 'Hello');
  });
});
