'use strict';

// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

var bowerJS = require('wiredep')({
  exclude: ['pouchdb-nightly', 'jasmine'],
  devDependencies: true
}).js;

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: bowerJS.concat([
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ]),

    // list of files / patterns to exclude
    exclude: [
      'app/scripts/main.js'
    ],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    // grunt-karma-coveralls
    reporters: [
      'progress',
      'coverage'
    ],
    preprocessors: {
      'app/scripts/**/*.js': 'coverage'
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage'
    },
    plugins: [
      'karma-*'
    ]
  });
};
