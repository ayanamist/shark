/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Config  = require(__dirname + '/config.js');
var Log     = require(__dirname + '/log.js');
var Extend  = require(__dirname + '/extend.js');
var Mysql   = require(__dirname + '/mysql.js');

/**
 * @存放对象的对象列表
 */
var __objects_list  = {};

/**
 * @key归一化
 */
function _idx_normalize(idx) {
  return idx.trim().toLowerCase();
}

/* {{{ public function cleanAll() */
/**
 * Remove objects from the factory
 */
function cleanAll(/*key*/) {
  switch (arguments.length) {
    case 0:
      __objects_list = {};
      break;

    default:
      delete __objects_list[_idx_normalize(arguments[0])];
      break;
  }
}
exports.cleanAll = cleanAll;
/* }}} */

/* {{{ public function setObject() */
/**
 * @param {String} key, indexName of the Object
 * @param {Object} obj
 * @return null
 */
function setObject(key, obj, _clone) {
  if (obj) {
    __objects_list[_idx_normalize(key)] = _clone ? Extend.clone(obj) : obj;
  }
}
exports.setObject = setObject;
/* }}} */

/* {{{ public function getObject() */
/**
 * visit an object according by indexName (key)
 */
function getObject(key, _clone) {
  key = _idx_normalize(key);
  if (undefined === __objects_list[key]) {
    return null;
  }

  return _clone ? Extend.clone(__objects_list[key]) : __objects_list[key];
}
exports.getObject = getObject;
/* }}} */

/* {{{ public function setMysql() */
function setMysql(key, obj) {
  if (!obj.query) {
    obj = Mysql.create(obj);
  }
  return setObject('#mysql/' + key, obj, false);
}
exports.setMysql = setMysql;
/* }}} */

/* {{{ public function getMysql() */
function getMysql(key) {
  var mysql = getObject('#mysql/' + key, false);
  return mysql ? mysql : require(__dirname + '/blackhole/mysql.js').create();
}
exports.getMysql = getMysql;
/* }}} */

/* {{{ public function setLog() */
function setLog(key, obj) {
  if (!obj.debug || 'function' != typeof(obj.debug)) {
    obj = Log.create(obj);
  }
  return setObject('#log/' + key, obj, false);
}
exports.setLog = setLog;
/* }}} */

/* {{{ public function getLog() */
function getLog(key) {
  var _log = getObject('#log/' + key, false);
  return _log ? _log : require(__dirname + '/blackhole/log.js').create();
}
exports.getLog = getLog;
/* }}} */

/* {{{ public function setConfig() */
exports.setConfig = function(key, obj) {
  if (!obj.get || 'function' !== typeof(obj.get)) {
    obj = Config.create(obj);
  }

  return setObject('#config/' + key, obj, false);
}
/* }}} */

/* {{{ public function getConfig() */
exports.getConfig = function(key) {
  var _conf = getObject('#config/' + key, false);
  return _conf ? _conf : require(__dirname + '/blackhole/config.js').create();
};
/* }}} */

