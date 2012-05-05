/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
// +--------------------------------------------------------------------+
// | (C) 2011-2012 Alibaba Group Holding Limited.                       |
// | This program is free software; you can redistribute it and/or      |
// | modify it under the terms of the GNU General Public License        |
// | version 2 as published by the Free Software Foundation.            |
// +--------------------------------------------------------------------+
// Author: pengchun <pengchun@taobao.com>

function noop() {
}

exports.create  = function() {
  return {
    'debug'     : noop,
    'notice'    : noop,
    'warn'      : noop,
    'error'     : noop,
    'close'     : noop,
  };
}
