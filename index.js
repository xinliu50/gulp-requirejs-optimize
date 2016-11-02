// refactored from gulp-requirejs-optimize
// https://www.npmjs.com/package/gulp-requirejs-optimize/

/*jshint node: true, unused: true, undef: true */

var gutil = require('gulp-util');
var transfob = require('transfob');
var requirejs = require('requirejs');
var chalk = require('chalk');
var path = require('path');

requirejs.define( 'node/print', [], function() {
  return function( message ) {
    message = message.substring(0, 5) === 'Error' ?
      chalk.red( message ) : message;
    gutil.log( message );
  };
});

function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

module.exports = function rjsOptimize( options ) {

  options = options || {};
  options.logLevel = 2;

  var stream = transfob( function( file, encoding, callback ) {

    var opts = extend( {}, options );
    // include the file path
    var name;
    if ( opts.baseUrl ) {
      name = path.relative( opts.baseUrl, file.path );
    } else {
      name = file.relative;
    }

    opts.include = opts.include || [];
    opts.include.unshift( name );

    opts.out = function( text ) {
      var outFile = new gutil.File({
        path: file.relative,
        contents: new Buffer( text )
      });
      callback( null, outFile );
    };

    gutil.log('RequireJS optimizing');
    requirejs.optimize( opts, null, function( err ) {
      var gulpError = new gutil.PluginError( 'requirejsOptimize', err.message );
      stream.emit( 'error', gulpError );
    });
  });

  return stream;
};
