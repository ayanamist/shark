/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

module.exports  = function (name, message) {
  var _me   = new Error(message);
  _me.name  = name.trim(); 

  return _me;
};

