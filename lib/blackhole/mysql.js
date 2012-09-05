/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var _mysql  = {};
_mysql.query = function (sql, callback) {
  callback(new Error('MysqlBlackhole'));
};

exports.create  = function () {
  return _mysql;
};

exports.createPool = function () {
  var _me   = {};
  _me.query = _mysql.query;
  _me.addserver = function (mysql) {
  };

  return _me;
};

