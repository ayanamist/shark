/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

var Mysql   = require('mysql-libmysqlclient');
var Pool    = require(__dirname + '/pool.js');

exports.create  = function(options) {

  /**
   * @连接池大小
   */
  var _size = 5;

  /**
   * @连接池配置
   */
  var _pool = {
    'size'  : 5,
    'idle'  : 60000,
  };

  /**
   * @Mysql配置
   */
  var _conf = {
    'port'      : 3306,
    'user'      : 'root',
    'pass'      : '',
    'dbname'    : '',
    'charset'   : 'UTF8',
  };

  /**
   * @机器列表
   */
  var _host = ['127.0.0.1'];

  /* {{{ 配置读取 */

  for (var i in options) {
    switch (i) {
      case 'host':
        _host   = Array.isArray(options[i]) ? options[i] : options[i].split(',');
        break;

      case 'pool':
      case 'size':
      case 'poolsize':
        _size   = options[i] - 0;
        break;

      default:
        _conf[i]    = options[i];
        break;
    }
  }

  var _pos  = 0;
  while (_host.length < _size) {
    _host.push(_host[(_pos++) % _host.length]);
  }

  /* }}} */

  var _self   = {};

  /**
   * @连接池
   */
  var _conn = [];

  /**
   * @计数器
   */
  var _reqn = 0;

  /* {{{ 建立连接 */

  _host.forEach(function(host) {
    var _db = Mysql.createConnectionSync();
    _db.connectSync(host, _conf.user, _conf.pass, _conf.dbname, _conf.port);
    _db.querySync('SET AUTOCOMMIT=1');
    if (_db.connectedSync()) {
      _db.setCharsetSync(_conf.charset);
      if (1 == _conn.push(_db)) {
        process.nextTick(review_queued_query);
      }
    }
  });

  /* }}} */

  var _sqls = [];
  function review_queued_query() {
    var the = _sqls.shift();
    if (!the) {
      return;
    }
    _self.query(the.shift(), the.pop());
    process.nextTick(review_queued_query);
  }

  /* {{{ public function query() */
  _self.query = function(sql, callback) {
    if (!_conn.length) {
      _sqls.push([sql, callback]);
      return;
    }

    var _db = _conn[(_reqn++) % _conn.length];
    _db.querySend(sql, function(err, res) {
      if (err) {
        callback(err, null);
      } else if (undefined !== res.fieldCount) {
        res.fetchAll(function(err, rows) {
          callback(err, rows);
        });
      } else {
        callback(null, res);
      }
    });
  };
  /* }}} */

  return _self;
}

