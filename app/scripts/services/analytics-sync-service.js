'use strict';

angular.module('lmisChromeApp')
  .service('analyticsSyncService', function($q, storageService, trackingFactory) {
    var tracker = trackingFactory.tracker;
    
    //syncs clicks events
    this.syncClicks = function() {
      var uuids = [];
      storageService.all(storageService.CLICKS)
        .then(function(clicksData) {
          clicksData.forEach(function(click) {
            tracker.sendEvent('Offline Clicks', click.action, click.label);
            uuids.push(click.uuid);
          });
        })
        .then(function() {
          if (uuids.length>0) {
            storageService.removeRecords(storageService.CLICKS, uuids);
          }
        })
        .finally(function() {
          console.log('pending clicks list cleared ');
        });
    };

    //syncs analytics exceptions
    this.syncExceptions = function() {
      var uuids = [];
      storageService.all(storageService.EXCEPTIONS)
        .then(function(exceptionData) {
          exceptionData.forEach(function(exception) {
            console.log('except uuid: ' + exception.uuid);
            //best to get a success flag here and delete if event successfuly sent
            uuids.push(exception.uuid);
          });
        })
        .then(function() {
            if (uuids.length>0){
          storageService.removeRecords(storageService.EXCEPTIONS, uuids);
            }
        })
        .finally(function() {
          console.log('pending excepts list cleared');
        });
    };

    //syncs analytics page views
    this.syncPageViews = function() {
      var uuids = [];
      storageService.all(storageService.PAGEVIEWS)
        .then(function(pageViewData) {
          pageViewData.forEach(function(pageView) {
            tracker.sendAppView(pageView.page);
            uuids.push(pageView.uuid);
          });
        })
        .then(function() {
          if (uuids.length>0) {
            storageService.removeRecords(storageService.PAGEVIEWS, uuids);
          }
        })
        .finally(function() {
          console.log('pending pages list cleared');
        });

    };
    
    //syncs analytics lost records
    this.syncLostRecords = function() {
      storageService.all(storageService.ANALYTICS_LOST_RECORDS)
        .then(function(data) {
            var obj = data[0];
            var clicks = obj.clicks;
            var exceptions = obj.exceptions;
            var pages = obj.pages;

            tracker.sendEvent("lost data","clicks", "",  clicks);
            tracker.sendEvent("lost data","exceptions", "",  exceptions);
            tracker.sendEvent("lost data","pages", "",  pages);
            return obj;
        })
        .then(function(obj) {
          storageService.removeRecord(storageService.ANALYTICS_LOST_RECORDS, obj.uuid)
        })
        .finally(function() {
          console.log('pending pages list cleared');
        });

    };
    
  });
