'use strict';

angular.module('lmisChromeApp')
  .service('analyticsSyncService', function($q, $log, storageService, trackingService) {
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

    this.syncClicks = function() {
      function syncClick(click) {
        // TODO: find a way to get a success flag here and delete if event
        //       successfuly sent
        tracker.sendEvent('Offline clicks', click.action, click.label);
      }
      return sync('CLICKS', syncClick);
    };

    this.syncExceptions = function() {
      function syncException(exception) {
        $log.info('Exception UUID: ' + exception.uuid);
      }
      return sync('EXCEPTIONS', syncException);
    };

    this.syncPageViews = function() {
      function syncPageView(pageView) {
        tracker.sendAppView(pageView.page);
      }
      return sync('PAGE_VIEWS', syncPageView);
    };
  });
