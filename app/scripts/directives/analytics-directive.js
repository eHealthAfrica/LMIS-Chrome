'use strict';

angular.module('lmisChromeApp')
  .directive('lmisAnalyticsDirective', function(trackingService) {
    return {
      restrict: 'AE',
      link: function(scope, element, attr) {
        var tracker = trackingService.getTracker();

        element.on('click', function() {
          tracker.sendEvent('Click', element.text(), attr.lmisPageViewReport);
        });
      }
    };
  })

  .directive('lmisPageViewReport', function(trackingService) {
    return function(scope, element, attr) {
      var tracker = trackingService.getTracker();
      tracker.sendAppView(attr.lmisPageViewReport);
    };
  });
