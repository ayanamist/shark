/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Config  = require(__dirname + '/../../lib/config.js').create(__dirname + '/etc/memcache.ini');
var Mcache  = require(__dirname + '/../../lib/cache/memcache.js');

var _me = Mcache.create(Config.get('servers'), Config.get('options'));


function setup(c) {

  var n = 0;
  var c = c || 1000;

  function next(i) {
    _me.set('benchmark_test_' + i, i, function(error, result) {
      if ((++i) >= c) {
        return;
      }
      next(i);
    });
  };

  next(n);
}

setInterval(function() {
  var m = process.memoryUsage();
  console.log(m.rss + "\t" + m.heapTotal + "\t" + m.heapUsed);
}, 1000);
setup(1000);
