/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Mysql   = require('mysql');
var Pool    = require(__dirname + '/pool.js');

exports.create  = function(options) {

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
    'timeout'   : 10,
  };

  /**
   * @机器列表
   */
  var _host = ['127.0.0.1'];

  /* {{{ 配置读取 */

  for (var i in options) {
    if ('host' === i) {
      _host = Array.isArray(options[i]) ? options[i] : options[i].split(',');
      continue;
    }

    var match   = i.match(/^pool\.(\w+)/);
    if (match) {
      var k = match[1];
      _pool[k]  = options[i];
    } else {
      _conf[i]  = options[i];
    }
  }

  /* }}} */

  /**
   * @计数器
   */
  var _next = 0;

  /* {{{ 连接器 */
  /**
   * 连接池用到的创建器
   *
   * @access private
   */
  var _creator  = function () {
    var who = _host[(_next++) % _host.length];
    var _db = Mysql.createConnection({
      'host' : who,
        'port'  : _conf.port,
        'user'  : _conf.user,
        'password'  : _conf.pass,
        'database'  : _conf.dbname,
        'charset'   : _conf.charset,
    });

    _db.connect();
    _db.close = function () {
      _db.end();
      _db = null;
    };
    //}

    return _db;
  };
  /* }}} */

  /**
   * @连接池
   */
  var _conn = Pool.create(_creator, _pool);

  var _self = {};

  /* {{{ public function query() */
  _self.query = function(sql, callback) {
    _conn.get(function (_db, id) {
      _db.query(sql, function(error, rows) {
        _conn.free(id);
        callback(error, rows);
      });
    });
  };
  /* }}} */

  return _self;
}

