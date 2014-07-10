'use strict';

angular.module('lmisChromeApp')
  .factory('trackingFactory', function($window, $rootScope, config, utility, appConfigService) {

    var tracker;
    if (utility.has($window, 'analytics')) {
      var service = $window.analytics.getService(config.analytics.service);
      tracker = service.getTracker(config.analytics.propertyID);

      appConfigService.getCurrentAppConfig()
        .then(function(config) {
          tracker.set('userId', config.uuid);
        });

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
