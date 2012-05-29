/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs  = require('fs'), path = require('path');

exports.init    = function(file, root) {

  /**
   * @根路径
   */
  var _dirroot  = path.normalize(root ? root : __dirname + '/../');

  var _fixpath  = function(dir) {
    if ('/' != dir.charAt(0)) {
      dir   = path.normalize(_dirroot + '/' + dir);
    }

    return dir;
  };

  /* {{{ private function _loadprop() */
  var _loadprop = function(file) {
    var data  = {};

    try {
      fs.readFileSync(_fixpath(file), 'utf8').trim().split('\n').forEach(function(line) {
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
  /* }}} */

  /**
   * @默认属性
   */
  var _defaults = file ? _loadprop(file) : {};

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
  _me.$         = function (key) {
    return undefined !== _defaults[key] ? _defaults[key] : '$' + key;
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
    values    = values || {};

    var _text = fs.readFileSync(_fixpath(source), 'utf8');
    var match = _text.match(/##(.+?)##/g);
    if (match) {
      match.forEach(function(item) {
        var i = item.slice(2, item.length - 2);
        if (undefined !== values[i]) {
          _text   = _text.replace(item, values[i]);
        } else if (undefined !== _defaults[i]) {
          _text   = _text.replace(item, _defaults[i]);
        }
      });
    }

    fs.writeFileSync(_fixpath(target), _text, 'utf8');
  };
  /* }}} */

  /* {{{ public function makedir() */
  _me.makedir   = function(dir, mode) {
    dir = _fixpath(dir);
    if (!path.existsSync(dir)) {
      var p = path.dirname(dir);
      if (p && p != dir) {
        _me.makedir(p);
      }
      fs.mkdirSync(dir, mode || 0755);
    }
    return _me;
  };
  /* }}} */

  return _me;

};

exports.setmode = function(path, mode) {
  exports.fileset(path, function(file) {
    fs.chmodSync(file, mode);
  });
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

