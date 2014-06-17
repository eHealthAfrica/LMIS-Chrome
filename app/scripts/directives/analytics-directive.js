'use strict';

angular.module('lmisChromeApp')
  .directive('lmisAnalyticsDirective', function(trackingFactory) {
    return {
      restrict: 'AE',
      link: function(scope, element, attr) {
        var tracker = trackingFactory.tracker();
        element.on('click', function() {
          tracker.sendEvent('Click', element.text(), attr.lmisPageViewReport);
        });
      }
    };
  })

  .directive('lmisPageViewReport', function(trackingFactory) {
    return function(scope, element, attr) {
      var tracker = trackingFactory.tracker();
      tracker.sendAppView(attr.lmisPageViewReport);
    };
  });
