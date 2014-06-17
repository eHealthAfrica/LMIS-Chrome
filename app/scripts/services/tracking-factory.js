'use strict';

angular.module('lmisChromeApp')
  .factory('trackingFactory', function($window, config) {
    return {
      tracker: function() {
        if ('analytics' in $window) {
          var service = $window.analytics.getService(config.analytics.service);
          return service.getTracker(config.analytics.propertyID);
        }
      }
    };
  });
