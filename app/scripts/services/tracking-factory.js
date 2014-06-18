'use strict';

angular.module('lmisChromeApp')
  .factory('trackingFactory', function($window, $rootScope, config, utility) {

    var tracker;
    if (utility.has($window, 'analytics')) {
      var service = $window.analytics.getService(config.analytics.service);
      tracker = service.getTracker(config.analytics.propertyID);

      $rootScope.$on('$stateChangeSuccess', function(event, state) {
        tracker.sendAppView(state.name);
      });

      $rootScope.$on('$stateNotFound', function(event, state) {
        tracker.sendException(state.to, false);
      });
    }
    
    //ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
    //use cache service to get cache to store things temporarilly

    return {
      tracker: tracker
    };
  });
