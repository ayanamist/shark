/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";
exports.create  = function() {
  return {
    'query' : function(sql, callback) {
      callback(new Error('MysqlBlackhole'));
    },
  };
}

