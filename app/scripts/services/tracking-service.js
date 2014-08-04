'use strict';

// TODO: design the priority queue bit based on the storage capacity restriction
//       on the local storage
// TODO: introduce a table for the lost records count
angular.module('lmisChromeApp')
  .service('trackingService', function trackingService($q, $log, $window, $rootScope, config, utility, storageService, deviceInfoFactory, appConfigService) {
    var tracker = {
      sendAppView: function() {},
      sendException: function() {},
      sendEvent: function() {},
      set: function() {}
    };

    var eventsLimit = config.analytics.eventsLimit;
    var exceptionsLimit = config.analytics.exceptionsLimit;
    var pagesLimit = config.analytics.pagesLimit;

    function removeExcessRecords(table, limit) {
      var uuids = [];
      var sizes = [];
      var toDelete = [];
      var deferred = $q.defer();

      storageService.all(table)
        .then(function(tableData) {
          tableData.forEach(function(data) {
            var count = JSON.stringify(data).length;
            uuids.push(data.uuid);
            sizes.push(count);
          });
        })
        .then(function() {
          var total = 0;
          for (var i = 0; i < uuids.length; i++) {
            if (total > limit) {
              toDelete.push(uuids[i]);
            } else {
              total += sizes[i];
            }
          }
          storageService.removeRecord(table, toDelete);
          deferred.resolve(toDelete.length);
        });
      return deferred.promise;
    }

    function postEvent(category, action, label) {
      deviceInfoFactory.canConnect()
        .then(function() {
          tracker.sendEvent(category, action, label);
        })
        .catch(function() {
          var _event = {
            action: action,
            label: label
          };
          storageService.save(storageService.CLICKS, _event)
            .then(function() {
              return removeExcessRecords(storageService.CLICKS, eventsLimit);
            });
        });
    }

    function postAppView(page) {
      deviceInfoFactory.canConnect()
        .then(function() {
          tracker.sendAppView(page);
        })
        .catch(function() {
          var _pageview = {
            page: page
          };
          storageService.save(storageService.PAGE_VIEWS, _pageview)
            .then(function() {
              return removeExcessRecords(storageService.PAGE_VIEWS, pagesLimit);
            });
        });
    }

    function postException(description, fatal) {
      deviceInfoFactory.canConnect()
        .then(function() {
          tracker.sendException(description, fatal);
        })
        .catch(function() {
          var _exception = {
            // jshint camelcase: false
            opt_description: description,
            opt_fatal: fatal
          };
          storageService.save(storageService.EXCEPTIONS, _exception)
            .then(function() {
              return removeExcessRecords(storageService.EXCEPTIONS, exceptionsLimit);
            });
        });

    }

    function registerListeners() {
      $rootScope.$on('$stateChangeSuccess', function(event, state) {
        postAppView(state.name);
      });
      $rootScope.$on('$stateNotFound', function(event, state) {
        postException(state.to, false);
      });
    }

    function setUUID() {
      appConfigService.getCurrentAppConfig()
        .then(function(config) {
          // Workaround item:750
          if (utility.has(config, 'uuid')) {
            tracker.set('userId', config.uuid);
          }
        })
        .catch(function() {
          var msg = [
            'Could not get current app config.',
            'Proceeding to track anonymously.'
          ].join('\n');
          $log.info(msg);
        });
    }

    if (utility.has($window, 'analytics')) {
      var service = $window.analytics.getService(config.analytics.service);
      tracker = service.getTracker(config.analytics.propertyID);
      registerListeners();

      $rootScope.$on('MEMORY_STORAGE_LOADED', setUUID);
    }

    this.tracker = tracker;
    this.postEvent = postEvent;
    this.postException = postException;
    this.postAppView = postAppView;
  });
