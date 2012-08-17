/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.version = '0.3.16';

require('fs').readdirSync(__dirname + '/lib').forEach(function (item) {
  var m = item.match(/(.+?)\.js$/);
  if (!m || !m[1]) {
    return;
  }

  exports.__defineGetter__(m[1], function () {
    return require(__dirname + '/lib/' + m[0]);
  });
});

exports.setExceptionLogger = require('./lib/log.js').setExceptionLogger;
exports.logException = require('./lib/log.js').exception;

