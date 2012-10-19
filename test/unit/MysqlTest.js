/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var config  = require(__dirname + '/../../lib/config.js');
var Mysql   = require(__dirname + '/../../lib/mysql.js');

/**
 * @mysql配置
 */
var options = config.create(__dirname + '/etc/mysql_test.ini').all();

describe('mysql with node-mysql', function () {

  /* {{{ should_mysql_with_4_conn_pool_works_fine() */
  it('should_mysql_with_4_conn_pool_works_fine', function (done) {
    Mysql.create(options).query('SELECT 1', function (error, rows, info) {
      should.ok(!error);
      rows.should.eql([{'1':'1'}]);
      done();
    });
  });
  /* }}} */

  /* {{{ should_mysql_blackhole_works_fine() */
  it('should_mysql_blackhole_works_fine', function (done) {
    var mysql   = require(__dirname + '/../../lib/blackhole/mysql.js').create();
    mysql.query('select', function (error, data) {
      error.toString().should.include('MysqlBlackhole');
      done();
    });
  });
  /* }}} */

  /* {{{ should_mysql_query_works_fine() */
  it('should_mysql_query_works_fine', function (done) {
    options.dbname  = 'test';
    var _me = Mysql.create(options);
    var sql = 'CREATE TABLE only_for_unittest (' + 
      'id int(10) unsigned not null auto_increment primary key,'+
      'txt varchar(2) not null default ""' +
      ')ENGINE=MYISAM';

    _me.query('DROP TABLE IF EXISTS only_for_unittest', function (error, info) {
      should.ok(!error);
      info.should.have.property('affectedRows', 0);

      _me.query(sql, function (error, info) {
        should.ok(!error);
        _me.query('INSERT INTO only_for_unittest (txt) VALUES ("test")', function (error, info) {
          should.ok(!error);
          info.should.have.property('insertId', 1);
          info.should.have.property('affectedRows', 1);
          _me.query('SELECT id,txt FROM test.only_for_unittest', function (error, rows) {
            rows.should.eql([{
              'id'  : 1,
              'txt' : 'te',
            }]);
            _me.query('SELECT * FROM test.only_for_unittest WHERE 0', function (error, rows) {
              should.ok(!error);
              rows.should.have.property('length', 0);
              done();
            });
          });
        });
      });
    });
  });
  /* }}} */

});

describe('mysql pool', function () {

  var _pool = Mysql.createPool({
    'poolsize' : 10,
  });
  _pool.addserver(options);

  it ('should_connect_works_fine', function (done) {
    done();
  });

});

