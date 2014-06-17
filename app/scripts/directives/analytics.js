'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingFactory) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        var tracker = trackingFactory.tracker;
        element.on('click', function() {
          tracker.sendEvent('Click', element.text(), attr.gaClick);
        });
      }
    };
  });
