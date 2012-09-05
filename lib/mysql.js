/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Mysql   = require('mysql');

exports.create  = function(options) {

  /**
   * @Mysql配置
   */
  var _options  = {
    'host'      : '127.0.0.1',
    'port'      : 3306,
    'user'      : 'root',
    'pass'      : '',
    'dbname'    : '',
    'charset'   : 'UTF8',
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  /**
   * @连接对象
   */
  var _conn = Mysql.createConnection({
    'host'  : _options.host
    ,'port' : _options.port
    ,'user' : _options.user
    ,'password' : _options.pass
    ,'database' : _options.dbname
    ,'charset'  : _options.charset
  });

  var _self = {};

  /* {{{ public function query() */
  _self.query = function(sql, callback) {
    _conn.query(sql, callback);
  };
  /* }}} */

  return _self;
}

exports.createPool = function (options) {

  /**
   * @ 在线机器
   */
  var online = [];

  /**
   * @ 备用机器
   */
  var backup = [];

  /**
   * @ 请求次数
   */
  var reqnum = 0;

  var _me = {};

  _me.addserver = function (o) {
  };

  _me.query = function (sql, callback) {
  };

  return _me;
};

