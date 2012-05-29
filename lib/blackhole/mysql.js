/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

exports.create  = function() {
  return {
    'query' : function(sql, callback) {
      callback(new Error('MysqlBlackhole'));
    },
  };
}

