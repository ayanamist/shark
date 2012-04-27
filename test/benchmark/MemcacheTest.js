/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Config  = require(__dirname + '/../../lib/config.js').create(__dirname + '/etc/memcache.ini');
var Mcache  = require(__dirname + '/../../lib/cache/memcache.js').create(
    Config.get('servers'), Config.get('options')
    );

