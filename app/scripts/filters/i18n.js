'use strict';

angular.module('lmisChromeApp')
  .filter('i18n', function($window) {
    return function(key) {
      return $window.chrome.i18n.getMessage(key);
    };
  });
