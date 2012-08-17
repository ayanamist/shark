/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs = require('fs');

try {
  exports.version = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8').trim()).version;
} catch (e) {
  exports.version = 'unknown';
}

fs.readdirSync(__dirname + '/lib').forEach(function (item) {
  var m = item.match(/(.+?)\.js$/);
  if (!m || !m[1]) {
    return;
  }

  exports[m[1]] = require(__dirname + '/lib/' + m[0]);
});

exports.setExceptionLogger = exports.log.setExceptionLogger;
exports.logException = exports.log.exception;

