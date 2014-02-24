'use strict';

angular.module('lmisChromeApp')
  .filter('titlecase', function () {
    return function(s) {
      s = ( s === undefined || s === null ) ? '' : s;
      return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
        return ch.toUpperCase();
      });
    };
  });
