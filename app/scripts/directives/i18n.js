'use strict';

angular.module('lmisChromeApp')
  .directive('i18n', function($window) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.text($window.chrome.i18n.getMessage(attrs.i18n));
      }
    };
  });
