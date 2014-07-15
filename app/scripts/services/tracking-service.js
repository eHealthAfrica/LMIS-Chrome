'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
//need to design the priority queue bit based on the storage capacity restriction on the local storage and introduce a table for the lost records count

angular.module('lmisChromeApp')
  .service('trackingService', function trackingService($q, $window, $rootScope, config, utility, deviceInfoFactory, storageService, pouchStorageService, appConfigService) {
    var tracker = { 
      sendAppView: function() {},
      sendException: function() {},
      sendEvent: function() {},
      set: function() {}
    };

    function setUUID(config) {
      tracker.set('userId', config.uuid);
    }

    function registerListeners() {
      $rootScope.$on('$stateChangeSuccess', function(event, state) {
        tracker.sendAppView(state.name);
      });
      $rootScope.$on('$stateNotFound', function(event, state) {
        tracker.sendException(state.to, false);
      });
    }

    if (utility.has($window, 'analytics')) {
      var service = $window.analytics.getService(config.analytics.service);
      tracker = service.getTracker(config.analytics.propertyID);
      registerListeners();
      appConfigService.getCurrentAppConfig()
        .then(setUUID);
    }

    this.tracker = tracker;
    
  });
