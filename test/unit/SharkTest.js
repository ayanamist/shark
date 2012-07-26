/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Shark   = require(__dirname + '/../../');

describe('shark interface', function () {

  it('should_shark_log_works_fine', function () {
    ['build', 'cache', 'config', 'error', 'extend', 'log', 'pool'].forEach(function (prop) {
      Shark.should.have.property(prop);
    });
  });

});
