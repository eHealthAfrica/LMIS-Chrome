'use strict';

angular.module('lmisChromeApp')
  .factory('i18n', function($window) {
    return {
      i18n: $window.chrome.i18n.getMessage
    };
  });
