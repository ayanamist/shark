/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');

var Builder = require(__dirname + '/../lib/build.js');

var _props  = path.normalize(__dirname + '/../default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props)) {
  var _me = Builder.init();
  _me.makeconf('build/tpl/default.properties', _props, {
    'dir.root'    : path.normalize(__dirname + '/../'),
    'log.root'    : path.normalize(__dirname + '/../log/'),

    'mysql.default.host'        : '127.0.0.1,localhost',
    'mysql.default.port'        : 3306,
    'mysql.default.user'        : 'root',
    'mysql.default.password'    : '',
    'mysql.default.dbname'      : '',

    'memcache.default.host'     : '127.0.0.1:11211,localhost:11213',
  });
}

var _me = Builder.init(_props, __dirname + '/../');

_me.makedir('test/unit/etc');
_me.makedir('test/unit/tmp');

_me.makeconf('build/test/test_config_file.ini',   'test/unit/etc/test_config_file.ini');
_me.makeconf('build/test/test_config_file.js',    'test/unit/etc/test_config_file.js');
_me.makeconf('build/test/test_config_file.json',  'test/unit/etc/test_config_file.json');

_me.makeconf('build/test/mysql.ini',  'test/unit/etc/mysql_test.ini', {
  'mysql.default.host'      : _me.$('mysql.default.host'),
  'mysql.default.port'      : _me.$('mysql.default.port'),
  'mysql.default.user'      : _me.$('mysql.default.user'),
  'mysql.default.pass'      : _me.$('mysql.default.password'),
});
_me.makeconf('build/test/memcache.ini', 'test/unit/etc/memcache.ini', {
  'memcache.default.host'   : _me.$('memcache.default.host'),
});

_me.makeconf('build/test/memcache.ini', 'test/benchmark/etc/memcache.ini', {
  'memcache.default.host'   : _me.$('memcache.default.host'),
});

_me.makedir('bin');
_me.makeconf('build/codes/appctl.sh',   'bin/appctl', {
  'app.name'        : 'shark',
  'nodejs.bin'      : '/usr/local/bin/node',
});
Builder.setmode('bin/appctl', 0755);

_me.makeconf('build/codes/shark.js',    'bin/shark.js', {
  'app.name'        : 'shark',
  'nodejs.bin'      : '/usr/local/bin/node',
});
Builder.setmode('bin/shark.js', 0755);

