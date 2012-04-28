/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

/* {{{ function setup() */
function setup(_me) {

  var n = 0;

  function next() {
    _me.set('benchmark_test_' + n, n, function(error, result) {
      n++;
      next();
    }, 120);
  };

  setInterval(function() {
    var m = process.memoryUsage();
    console.log(n + "\t" + m.rss + "\t" + m.heapTotal + "\t" + m.heapUsed);
  }, 1000);

  next();
}
/* }}} */

var _cache  = null;
switch (process.argv.slice(2).unshift()) {

  case 'redis':
    _cache  = require(__dirname + '/../../lib/cache/redis.js').create('127.0.0.1:6379');
    break;

  default:
    _cache  = require(__dirname + '/../../lib/cache/memcache.js').create('127.0.0.1:11211');
    break;
}

setup(_cache);
