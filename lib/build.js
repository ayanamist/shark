/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs  = require('fs'), path = require('path');

exports.setmode = function(path, mode) {
  exports.fileset(path, function(file) {
    fs.chmodSync(file, mode);
  });
};

exports.parseProperties = function (file) {
  var data  = {};

  try {
    fs.readFileSync(file, 'utf8').trim().split('\n').forEach(function(line) {
      if (/^(#|!)/.test(line)) {
        return;
      }
      var match = line.match(/^\s*(.+?)\s*=\s*(.*)\s*$/);
      if (!match) {
        return;
      }

      data[match[1].trim()] = match[2].trim();
    });
  } catch (e) {
  }

  return data;
};

exports.fileset = function(dir, callback) {
  if (!fs.statSync(dir).isDirectory()) {
    callback(dir);
    return;
  }

  fs.readdirSync(dir).forEach(function(file) {
    var who = path.normalize(dir + '/' + file);
    if (fs.statSync(who).isDirectory()) {
      exports.fileset(who, callback);
    } else {
      callback(who);
    }
  });
};

exports.init    = function(file, root, force) {

  /**
   * @根路径
   */
  var _dirroot  = path.normalize(root ? root : __dirname + '/../');

  var _fixpath  = function(dir) {
    if ('/' != dir.charAt(0)) {
      dir = path.normalize(_dirroot + '/' + dir);
    }

    return dir;
  };

  /**
   * @默认属性
   */
  var _defaults = file ? exports.parseProperties(_fixpath(file)) : {};
  for (var i in force) {
    _defaults[i] = force[i];
  }

  /**
   * @任务
   */
  var _task = [];

  var _me   = {};

  /* {{{ public function property() */
  _me.property  = function() {
    return _defaults;
  };
  /* }}} */

  /* {{{ public function $() */
  _me.$         = function (key, _def) {
    return (undefined === _defaults[key]) ? _def : _defaults[key];
  };
  /* }}} */

  /* {{{ public function makeconf() */
  /**
   * 通过模版生成配置文件
   *
   * @access public
   * @return void
   */
  _me.makeconf  = function (source, target, values) {
    values  = values || {};
    source  = path.normalize(source);

    try {
      var isdir = fs.statSync(target).isDirectory();
    } catch (e) {
      var isdir = false;
    }

    exports.fileset(source, function (fname) {
      var _text = fs.readFileSync(_fixpath(fname), 'utf-8');
      var match = _text.match(/##(.+?)##/g);
      if (match) {
        match.forEach(function(item) {
          var i = item.slice(2, item.length - 2);
          if (undefined !== values[i]) {
            _text = _text.replace(item, values[i]);
          } else {
            var v = _me.$(i);
            if (undefined !== v) {
              _text = _text.replace(item, v);
            }
          }
        });
      }

      var _save = '';
      if (!isdir && '/' !== target.charAt(target.length - 1)) {
        _save = _fixpath(target);
      } else {
        _save = _fixpath(target + '/' + fname.replace(source, ''));
      }
      _me.makedir(path.dirname(_save));
      fs.writeFileSync(_save, _text, 'utf-8');
    });
  };
  /* }}} */

  /* {{{ public function makedir() */
  _me.makedir   = function(dir, mode) {
    dir = _fixpath(dir);
    if (!fs.existsSync(dir)) {
      var p = path.dirname(dir);
      if (p && p != dir) {
        _me.makedir(p);
      }
      fs.mkdirSync(dir, mode || 493/** 0755 */);
    }
    return _me;
  };
  /* }}} */

  return _me;

};

