/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');
var Builder = require('shark').build;
var Home    = __dirname + '/..';

var __APPNAME__ = 'shark';

/**
 * @强制参数 
 */
var _force  = Builder.parseProperties(Home + '/_private.properties');

/* {{{ process argv parse */

process.argv.slice(2).forEach(function (arg) {
  if (!(/^\-D/.test(arg))) {
    return;
  }

  var pattern   = arg.slice(2).split('=');
  switch (pattern.length) {
    case 0:
      break;

    case 1:
      _force[pattern[0]] = true;
      break;

    default:
      _force[pattern[0]] = pattern[1];
      break;
  }
});
/* }}} */

/* {{{ private function _extend() */
var _extend = function (a, b) {
  var m = require('shark').extend.clone(a);
  for (var i in b) {
    m[i] = b[i];
  }
  return m;
};
/* }}} */

var _props  = path.normalize(Home + '/default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  Builder.init(null, Home, _extend({

    /**
     * @Add default properties here
     */

    'dir.root' : Home,
    'log.root' : path.normalize(Home + '/log'),

  }, _force)).makeconf('resource/tpl/default.properties', _props);
}

var _me = Builder.init(_props, Home, _force);

/* {{{ task_make_test() */
var task_make_test = function () {
  _me.makedir('test/unit/etc');

  _me.makeconf(__dirname + '/master.ini', 'test/unit/etc/master.ini', {
    'app.name'  : 'unittest',
  });
};

/* }}} */

/* {{{ task_make_bin() */

var task_make_bin = function () {
  _me.makedir('bin');
  _me.makedir(_me.$('log.root'));
  _me.makeconf('node_modules/shark/resource/script/appctl.sh',   'bin/' + __APPNAME__, {
    'app.name'  : __APPNAME__,
    'pid.file'  : _me.$('pid.file', Home + '/run/' + __APPNAME__ + '.pid'),
    '200.file'  : _me.$('200.file', ''),
    'properties': _me.$('propfile', _props),
    'node.bin'  : _me.$('node.bin', process.execPath),
  });
  Builder.setmode('bin/' + __APPNAME__, 0755);

  _me.makeconf('node_modules/shark/resource/script/logrotate.sh', 'bin/logrotate', {
    'app.name'  : __APPNAME__,
  });
  Builder.setmode('bin/logrotate', 0755);
};
/* }}} */

task_make_test();
task_make_bin();
process.exit(0);

