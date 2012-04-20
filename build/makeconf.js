/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');

var Builder = require(__dirname + '/../lib/build.js');

var _props  = path.normalize(__dirname + '/../default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  var _me = Builder.init();
  _me.makeconf('build/tpl/default.properties', _props, {
    'dir.root'    : path.normalize(__dirname + '/../'),
    'log.root'    : path.normalize(__dirname + '/../log/'),

    /**<    itier元数据库配置   */
    'mysql.default.host'      : '127.0.0.1',
    'mysql.default.port'      : 3306,
    'mysql.default.user'      : 'root',
    'mysql.default.password'  : '',
    'mysql.default.dbname'    : '',
  });
}

var _me = Builder.init(_props);

_me.task('makeconf for unittest', function() {
  mkdir($('log.root'));

  _me.makeconf('build/tpl/test/test_config_file.ini',   'test/unit/etc/test_config_file.ini');
  _me.makeconf('build/tpl/test/test_config_file.js',    'test/unit/etc/test_config_file.js');
  _me.makeconf('build/tpl/test/test_config_file.json',  'test/unit/etc/test_config_file.json');
});

_me.execute();

