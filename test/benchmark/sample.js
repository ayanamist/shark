/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var suite = new (require('benchmark').Suite);

suite.on('cycle', function (evt) {
  console.log(String(evt.target));
});

suite.on('complete', function () {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
});

suite.add('a', function () {
  return 1;
});

suite.add('b', function () {
  return 2;
});

suite.run();

