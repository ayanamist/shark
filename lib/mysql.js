/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Mysql   = require('mysql');

var _extend = function (a, b) {
  a = a || {};
  b = b || {};
  for (var i in b) {
    a[i] = b[i];
  }
  return a;
};

exports.create  = function(options) {

  /**
   * @Mysql配置
   */
  var _options = _extend({
    'host'      : '127.0.0.1',
    'port'      : 3306,
    'user'      : 'root',
    'pass'      : '',
    'dbname'    : '',
    'charset'   : 'UTF8',
  }, options);

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
   * @ 配置参数
   */
  var _options  = _extend({
    'poolsize' : 4,
  }, options);

  /**
   * @ 备用机器
   */
  var backup  = [];

  /**
   * @ 只读机器列表
   */
  var rolist  = [];

  /**
   * @ 读写机器列表
   */
  var rwlist  = [];

  /* {{{ private function connect() */
  /**
   * @ 连接一个指定的mysql服务
   *
   * @ param Integer p
   */
  var connect = function (p) {
    if (undefined === p || !backup[p]) {
      return;
    }

    var c = Mysql.createConnection(backup[p]);
    c.connect(function (error) {
      if (error) {
        console.log(error);
        return;
      }

      /**
       * @ 判断读写
       */
      if (1) {
        rwlist.push(c);
      } else {
        rolist.push(c);
      }
    });

    return c;
  };
  /* }}} */

  var _me = {};

  _me.addserver = function (config) {
    if (!config.host) {
      return;
    }

    backup.push(_extend({
      'port' : 3306, 'user' : 'root', 'password' : '', 'charset' : 'UTF8'
    }, config));
    connect();
  };

  _me.query = function (sql, callback) {
  };

  return _me;
};

