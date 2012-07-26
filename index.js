/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Shark = {};

require('fs').readdirSync(__dirname + '/lib').forEach(function (item) {
  var m = item.match(/(.+?)\.js$/);
  if (m && m[1]) {
    Shark[m[1]] = require(__dirname + '/lib/' + m[0]);
  }
});

Shark.run = function (options) {

  /**
   * @ 项目根路径
   */
  /**<    node_modules/shark/index.js */
  var _root = __dirname + '/../..';

  /**
   * @ 配置项
   */
  var _conf = {
    'home'      : _root,
    'propfile'  : _root + '/default.properties',
    'logpath'   : _root + '/log',
    'runpath'   : _root + '/run',
    'etcpath'   : _root + '/etc',
    'tplpath'   : _root + '/build/tpl',
  };
  for (var i in options) {
    _conf[i] = options[i];
  }

  var path  = require('path');
  if (!path.existsSync(_conf.propfile)) {
    throw new Error('Property file "' + _conf.propfile + '" not found.');
  }

  /* {{{ compile */

  var build = Shark.build;
  var maker = build.init(_conf.propfile, _conf.home);
  [_conf.logpath, _conf.runpath, _conf.etcpath].forEach(function (item) {
    maker.makedir(item);
  });

  build.fileset(_conf.tplpath, function (fname) {
    var _base = fname.slice(1 + _conf.tplpath.length);
    if (_base.match(/\.properties$/)) {
      return;
    }

    var _file = _conf.etcpath + '/' + _base;
    maker.makedir(path.dirname(_file));
    maker.makeconf(fname, _file);
  });
  /* }}} */

};

module.exports = Shark;
