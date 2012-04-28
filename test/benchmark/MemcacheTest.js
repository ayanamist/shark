/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Mcache  = require(__dirname + '/../../lib/cache/memcache.js');

var _me = Mcache.create('127.0.0.1:11211,127.0.0.1:11211');

var num = 0;
var run = 1;
function setup(c) {

  var n = 0;

  function next() {
    num++;
    _me.set('benchmark_test_' + n, n, function(error, result) {
      n++;
      if (!run) {
        return;
      }
      next();
    }, 120);
  };

  next();
}

setInterval(function() {
  var m = process.memoryUsage();
  console.log(num + "\t" + m.rss + "\t" + m.heapTotal + "\t" + m.heapUsed);
}, 1000);

setup();
