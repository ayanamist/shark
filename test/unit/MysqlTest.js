/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

var should  = require('should');
var config  = require(__dirname + '/../../lib/config.js');
var Mysql   = require(__dirname + '/../../lib/mysql.js');

/**
 * @mysql配置
 */
var options = config.create(__dirname + '/etc/mysql_test.ini').all();

describe('mysql pool with libmysqlclient', function() {

  /* {{{ should_mysql_with_4_conn_pool_works_fine() */
  it('should_mysql_with_4_conn_pool_works_fine', function(done) {
    Mysql.create(options).query('SELECT 1', function(error, rows, info) {
      should.ok(!error);
      rows.should.eql([{'1':'1'}]);
      done();
    });
  });
  /* }}} */

  /* {{{ should_sleep_100ms_async_run_works_fine() */
  it('should_sleep_100ms_async_run_works_fine', function(done) {
    var mysql   = Mysql.create(options);
    var total   = 5;
    var dones   = 0;
    var times   = [];
    for (var i = 0; i < total; i++) {
      times[i]  = (new Date()).getTime();
      (function() {
        var c   = i;
        mysql.query('SELECT ' + c + ' AS k,SLEEP(0.1)', function(error, rows, info) {
          should.ok(!error);
          rows.should.eql([{
            'k'   : c + '',
            'SLEEP(0.1)'    : '0',
          }]);
          times[c]  = (new Date()).getTime() - times[c];
          times[c].should.be.below(150);
          if ((++dones) >= total) {
            done();
          }
        });
      })();
    }
  });
  /* }}} */

  /* {{{ should_mysql_blackhole_works_fine() */
  it('should_mysql_blackhole_works_fine', function(done) {
    var mysql   = Mysql.blackhole();
    mysql.query('select', function(error, data) {
      error.toString().should.include('MysqlBlackhole');
      done();
    });
  });
  /* }}} */

  /* {{{ should_mysql_query_works_fine() */
  it('should_mysql_query_works_fine', function(done) {
    var _me = Mysql.create(options);
    _me.query('DROP TABLE IF EXISTS test.only_for_unittest', function(error, info) {
      should.ok(!error);
      info.should.have.property('affectedRows', 0);

      _me.query('CREATE TABLE test.only_for_unittest (' + 
          'id int(10) unsigned not null auto_increment primary key,'+
          'txt varchar(2) not null default \'\'' +
          ')ENGINE=MYISAM', function(error, info) {
        should.ok(!error);
        _me.query('INSERT INTO test.only_for_unittest (txt) VALUES (\'test\')', function(error, info) {
          info.should.have.property('insertId', 1);
          info.should.have.property('affectedRows', 1);
          _me.query('SELECT * FROM test.only_for_unittest', function(error, rows) {
            rows.should.eql([{
              'id'  : 1,
              'txt' : 'te',
            }]);
            done();
          });
        });
          });
        });
  });
  /**/

});
