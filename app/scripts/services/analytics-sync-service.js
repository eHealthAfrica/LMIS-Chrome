'use strict';

angular.module('lmisChromeApp').service('analyticsSyncService', function( storageService, trackingFactory) {


    var tracker = trackingFactory.tracker;
    this.syncClicks = function() {
        storageService.all(storageService.CLICKS).then(function(clicksData){
          clicksData.forEach(function(click) {
            console.log("uuid: " + click.uuid);
            console.log("timestamp: " + click.created);
            console.log("category: " + click.category);
            console.log("action: " + click.action);
            console.log("label: " + click.label);
            tracker.sendEvent("Offline Clicks", click.action, click.label);
            storageService.removeRecord(storageService.CLICKS,click.uuid);
        });
      }); 
    };

    this.syncExceptions = function() {

        storageService.all(storageService.EXCEPTIONS).then(function(exceptionData){
          exceptionData.forEach(function(exception) {
            console.log("uuid: " + exception.uuid);
            console.log("timestamp: " + exception.created);
            console.log("opt_dexcription: " + exception.opt_description);
            console.log("action: " + exception.opt_fatal);
            tracker.sendException( exception.opt_description, exception.opt_fatal);
            storageService.removeRecord(storageService.EXCEPTIONS,exception.uuid);
            });
        });
    };

    this.syncPageViews = function() {
        
        storageService.all(storageService.PAGE_VIEWS).then(function(pageViewData){
          pageViewData.forEach(function(pageView) {
            console.log("uuid: " + pageView.uuid);
            console.log("timestamp: " + pageView.created);
            console.log("opt_dexcription: " + pageView.page);
            tracker.sendAppView(pageView.page);
            storageService.removeRecord(storageService.PAGE_VIEWS,pageView.uuid);
            });
        });
    };
});