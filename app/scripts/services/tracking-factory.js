'use strict';

angular.module('lmisChromeApp')
  .factory('trackingFactory', function($window, $rootScope, config, utility) {

    var tracker;
    if (utility.hasDeep($window, 'analytics')) {
      var service = $window.analytics.getService(config.analytics.service);
      tracker = service.getTracker(config.analytics.propertyID);

      $rootScope.$on('$stateChangeSuccess', function(event, state) {
        tracker.sendAppView(state.name);
      });

      $rootScope.$on('$stateNotFound', function(event, state) {
        tracker.sendException(state.to, false);
      });
    }

    return {
      tracker: tracker
    };
  });
