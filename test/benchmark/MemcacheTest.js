/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Config  = require(__dirname + '/../../lib/config.js').create(__dirname + '/etc/memcache.ini');
var Mcache  = require(__dirname + '/../../lib/cache/memcache.js');

var _me = Mcache.create(Config.get('servers'), Config.get('options'));

var num = 0;
var run = 1;
function setup(c) {

  var c = c || 1000;
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

setup(1000);
