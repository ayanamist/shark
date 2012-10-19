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
    'password'  : '',
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
    ,'password' : _options.password
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
      'idletime' : 30000,
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
        // XXX: emit error
        console.log(error);
        return;
      }

      writeable(c, function (error, yes) {
        if (yes) {
          rwlist.push(c);
        } else {
          rolist.push(c);
        }
      });
    });

    return c;
  };
  /* }}} */

  /* {{{ private function writeable() */
  /**
   * @ 判断对DB的写入权限
   */
  var writeable = function (c, f) {
    c.query("SHOW VARIABLES LIKE 'READ_ONLY%'", function (error, res) {
      f = f || function () {};
      if (error) {
        return f(error, false);
      }

      var r = {};
      for (var i = 0; i < res.length; i++) {
        r = res[i];
        if (r && r.Variable_name && 'read_only' === r.Variable_name.toLowerCase()) {
          return f(null, r.Value && r.Value.match(/^(off)$/i) ? true : false);
        }
      }

      f(null, false);
    });
  };
  /* }}} */

  var _me = {};

  _me.addserver = function (config) {
    if (!config.host) {
      return;
    }

    backup.push(_extend({
      'port' : 3306,
      'user' : 'root',
      'password': '',
      'charset' : 'UTF8'
    }, config));

    connect(0);
  };

  _me.query = function (sql, callback) {
  };

  return _me;
};

