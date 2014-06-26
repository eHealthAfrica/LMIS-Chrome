'use strict';

var path = require('path');
var changeCase = require('change-case');

module.exports = function(grunt) {

  var collections = {};

  grunt.registerMultiTask('fixtures', 'Load fixtures', function() {
    var options = this.options({
      dest: ''
    });

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        var basename = path.basename(src, '.json');
        var constant = changeCase.constantCase(basename);
        collections[constant] = basename;
      });
    });

    if (options.dest) {
      collections = JSON.stringify(collections, null, 2);
      grunt.file.write(options.dest, collections);
      grunt.log.writeln('Wrote collections at ' + options.dest.cyan);

      grunt.config('ngconstant.fixtures', {
        options: {
          name: 'db',
          dest: options.dest
        },
        constants: {
          collections: grunt.file.readJSON(options.dest)
        }
      });
      grunt.task.run('ngconstant:fixtures');
    }
  });
};
