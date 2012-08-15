/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";
function noop() {
}

exports.create  = function() {
  return {
    'debug'     : noop,
    'notice'    : noop,
    'warn'      : noop,
    'error'     : noop,
    'close'     : noop,
    'flush'     : noop,
  };
}
