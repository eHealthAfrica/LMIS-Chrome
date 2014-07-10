'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingService) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        var tracker = trackingService.tracker;
        element.on('click', function() {
          tracker.sendEvent('Click', element.text().trim(), attr.gaClick);
        });
      }
    };
  });
