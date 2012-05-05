#!##nodejs.bin##
/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>
//

var Path    = require('path');
var Home    = __dirname + '/../';

var Builder = require(Home + '/lib/build.js');

/* {{{ config files builder  */

var _maker  = Builder.init(Home + '/##app.name##.properties', Home);

_maker.makedir('run');
_maker.makedir('.etc');

var confdir = Path.normalize(Home + '/build/tpl');
Builder.fileset(confdir, function(fname) {
  var _base = fname.slice(1 + confdir.length);
  if (_base.match(/\.properties$/)) {
    return;
  }

  var _file = Home + '/.etc/' + _base;
  _maker.makedir(Path.dirname(_file));
  _maker.makeconf(fname, _file, {
    'app.name'  : '##app.name##',
  });
});

/* }}} */

var config  = require(Home + '/lib/config.js').create(Home + '/.etc/master.ini');
var master  = require('node-cluster').Master(config.get('master', {
  'pidfile' : Home + '/run/##app.name##.pid',
}));

var options = config.all();
for (var key in options) {
  var match = key.match(/worker:(\w+)/);
  var child = options[key];
  if (match && child.script) {
    master.register(match[1], child.script, child);
  }
}

master.dispatch();
