'use strict';

angular.module('lmisChromeApp')
  .factory('i18n', function($window) {
    return $window.chrome.i18n.getMessage;
  });
