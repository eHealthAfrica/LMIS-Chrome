'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingFactory) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        element.on('click', function() {
          trackingFactory.postEvent('Click', element.text().trim(), attr.gaClick.trim());
        });
      }
    };
  });
