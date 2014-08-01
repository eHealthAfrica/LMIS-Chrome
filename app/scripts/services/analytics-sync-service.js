'use strict';

angular.module('lmisChromeApp')
  .service('analyticsSyncService', function($q, $log, storageService, trackingService, deviceInfoFactory) {
    var tracker = trackingService.tracker;

    function sync(type, syncFunction) {
      return storageService.all(storageService[type])
        .then(function(data) {
          data.forEach(function(datum) {
            syncFunction(datum);
          });
        })
        .then(function() {
          return storageService.remove(storageService[type]);
        })
        .then(function() {
          $log.info('pending ' + type.toLowerCase() + ' list cleared');
        });
    }

    function syncClicks() {
      function syncClick(click) {
        // TODO: find a way to get a success flag here and delete if event
        //       successfuly sent
        tracker.sendEvent('Offline clicks', click.action, click.label);
      }
      return sync('CLICKS', syncClick);
    }

    function syncExceptions() {
      function syncException(exception) {
        $log.info('Exception UUID: ' + exception.uuid);
      }
      return sync('EXCEPTIONS', syncException);
    }

    function syncPageViews () {
      function syncPageView(pageView) {
        tracker.sendAppView(pageView.page);
      }
      return sync('PAGE_VIEWS', syncPageView);
    }

    this.syncOfflineAnalytics = function() {
      var deferred = $q.defer();
      deviceInfoFactory.canConnect()
        .then(function() {
          var promises = [
             syncClicks(),
             syncExceptions(),
             syncPageViews()
          ];
          return $q.all(promises);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };
  });
