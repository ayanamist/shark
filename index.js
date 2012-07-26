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

  /**<    node_modules/shark/index.js */
  var _root = __dirname + '/../..';

  /**
   * @ 配置项
   */
  var _conf = {
    'home'      : _root,
    'logpath'   : _root + '/log',
    'runpath'   : _root + '/run',
    'etcpath'   : _root + '/etc',
  };
  for (var i in options) {
    _conf[i] = options[i];
  }

};

module.exports = Shark;
