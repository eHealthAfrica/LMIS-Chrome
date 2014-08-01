'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingService) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        element.on('click', function() {
          trackingService.postEvent('Click', element.text().trim(), attr.gaClick.trim());
        });
      }
    };
  });
