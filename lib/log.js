/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs = require('fs');
var moment = require('moment');

/**
 * @log level defination
 */
var DEBUG   = exports.DEBUG     = 0x01;
var NOTICE  = exports.NOTICE    = 0x02;
var WARN    = exports.WARN      = 0x04;
var ERROR   = exports.ERROR     = 0x08;
var ALL     = exports.ALL       = 0xff;

/* {{{ private function _flush_time() */
function _flush_time() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
}

var _timenow  = _flush_time();

/* }}} */

function serialize(info) {
  return JSON.stringify(info);
}

/* {{{ private function _print() */
function _print(msg, color) {
  console.log(msg);
}
/* }}} */

var _objects    = [];
var _timer      = setInterval(function() {
  _timenow      = _flush_time();
  _objects.forEach(function (log) {
    if (log && log.flush) {
      log.flush();
    }
  });
}, 500);
process.on('exit', function () {
  _objects.forEach(function (log) {
    if (log && log.close) {
      log.close();
    }
  });
  _objects  = [];
});

var _exceptionLoger = null;
exports.setExceptionLogger = function (options) {
  _exceptionLoger = exports.create(options);
};

exports.exception   = function (error, info) {
  if (_exceptionLoger) {
    _exceptionLoger._excep(error, info);
  }
};

exports.create  = function(options) {

  var _options  = {
    'file'  : '',
    'level' : ALL & ~DEBUG,
    'buffer': 16 * 1024,
  };

  for (var i in options) {
    _options[i] = options[i];
  }

  var _stream   = null;
  if (_options.file) {
    try {
      _stream   = fs.createWriteStream(_options.file, {
        'flags' : 'a+', 'encoding' : 'utf8', 'mode' : 420   /** 0644 */,
      });
    } catch (e) {
    }
  }

  var _buffers  = [];
  var _bufsize  = 0;

  function _build(type, tag, info) {
    return [type + ':', '[' + _timenow + ']', process.pid, tag.trim().toUpperCase(), serialize(info)].join("\t")
  };

  function _write(msg) {
    if (!_stream) {
      _print(msg);
      return;
    }

    _buffers.push(msg);
    _bufsize += msg.length;
    if (_bufsize >= _options.buffer) {
      _flush_stream();
    }
  }

  /* {{{ private function _flush_stream() */
  function _flush_stream() {
    if (_buffers.length < 1) {
      return;
    }
    _stream.write(_buffers.join("\n") + "\n");
    _buffers  = [];
    _bufsize  = 0;
  }

  var _self = {};

  /* }}} */

  /* {{{ public function debug() */
  _self.debug   = function(tag, info) {
    if (DEBUG & _options.level) {
      _write(_build('DEBUG', tag, info));
    }
  };
  /* }}} */

  /* {{{ public function notice() */
  _self.notice  = function(tag, info) {
    if (NOTICE & _options.level) {
      _write(_build('NOTICE', tag, info));
    }
  };
  /* }}} */

  /* {{{ public function warn() */
  _self.warn    = function(tag, info) {
    if (WARN & _options.level) {
      _write(_build('WARN', tag, info));
    }
  };
  /* }}} */

  /* {{{ public function error() */
  _self.error    = function(tag, info) {
    if (ERROR & _options.level) {
      _write(_build('ERROR', tag, info));
    }
  };
  /* }}} */

  /* {{{ public function close() */
  _self.close   = function() {
    if (_stream) {
      _flush_stream();
      _stream.end();
      _stream   = null;
    }
  };
  /* }}} */

  /* {{{ private function _excep() */
  _self._excep = function (error, info) {
    if (!(error instanceof Error)) {
      return;
    }

    var errName = '';
    if (!error.name) {
      errName = 'UnknownException';
    } else if (error.name.indexOf('Exception') < 0) {
      errName = error.name + 'Exception';
    }

    var msg = [_timenow + ' ' + errName + error.stack];
    for (var key in info) {
      msg.push(key + ': ' + serialize(info[key]));
    }
    msg.push(_timenow, '');
    _write(msg.join("\n"));
  };
  /* }}} */

  _self.flush   = _flush_stream;
  _objects.push(_self);

  return _self;

}

