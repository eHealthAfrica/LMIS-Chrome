#!/usr/bin/env node
'use strict';

var fs = require('fs'),
    git = require('gift')('.'),
    semver = require('semver');

var current = require('../package.json').version;

var files = ['package.json', 'bower.json', 'app/manifest.json'];

var args = process.argv.slice(2),
    bump = args[0];

if(bump === '-h' || bump === '--help') {
  console.log('version [<semver>|major|minor|patch]');
  process.exit();
}

files.forEach(function(file) {
  fs.exists(file, function(exists) {
    if(!exists) {
      console.error(file + ' does not exist');
      return;
    }
    fs.readFile(file, function(err, data) {
      if(err) {
        throw err;
      }
      var newVer = semver.inc(current, bump);

      if(!semver.valid(newVer)) {
        throw new Error('Not a valid semver version');
      }

      var json = JSON.parse(data);
      json.version = newVer;

      fs.writeFile(file, JSON.stringify(json, null, 2) + '\n', function(err) {
        if(err) {
          throw err;
        }

        git.add(files, function() {
          git.commit(newVer, function() {});
        });
      });
    });
  });
});
