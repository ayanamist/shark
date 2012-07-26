/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Shark   = require(__dirname + '/../../');

describe('shark interface', function () {

  it('should_shark_interface_works_fine', function () {
    ['build', 'cache', 'config', 'extend', 'log', 'pool', 'queue', 'redis'].forEach(function (prop) {
      Shark.should.have.property(prop);
    });
  });

});
