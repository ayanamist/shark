/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

// test coverage init, require all javascript files

require(__dirname + '/../../lib/build.js').fileset(__dirname + '/../../lib', function(fname) {
  if (fname.match(/\.js$/)) {
    require(fname);
  }
});

