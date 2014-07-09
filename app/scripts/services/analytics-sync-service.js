'use strict';

angular.module('lmisChromeApp').service('analyticsSyncService', function($q, storageService, trackingFactory) {


    var tracker = trackingFactory.tracker;
    this.syncClicks = function() {
        var uuids = [];
//        console.log("Loopin Clicks");
        storageService.all(storageService.CLICKS).then(function(clicksData) {
            clicksData.forEach(function(click) {
                //need to find a way to get a success flag here and delete if event successfuly sent
                tracker.sendEvent("Offline Clicks", click.action, click.label)
                uuids.push(click.uuid);
//                console.log("uuid: " + click.uuid);
            });
        }).then(function() {
            if (uuids)
                storageService.removeRecords(storageService.CLICKS, uuids);
        }).finally(function() {
            console.log("pending clicks list cleared ");
            });
    };

    //not final yet. Work in progress
    this.syncExceptions = function() {

        var uuids = [];
//        console.log("Loopin Excepts")
        storageService.all(storageService.EXCEPTIONS).then(function(exceptionData) {
            exceptionData.forEach(function(exception) {

                console.log("except uuid: " + exception.uuid);
                    //best to get a success flag here and delete if event successfuly sent
                uuids.push(exception.uuid);

            })
        }).then(function() {
            if (uuids)
                storageService.removeRecords(storageService.EXCEPTIONS, uuids);
        }).finally(function() {
            console.log("pending excepts list cleared");
    });
    };

    //not final yet. Worki in progress
    this.syncPageViews = function() {
        var uuids = [];
        console.log("Loopin Pages");

        storageService.all(storageService.PAGE_VIEWS).then(function(pageViewData) {
            pageViewData.forEach(function(pageView) {
                tracker.sendAppView(pageView.page);
                uuids.push(pageView.uuid);
            });
        }).then(function() {
            if (uuids)
                storageService.removeRecords(storageService.PAGE_VIEWS, uuids);
        }).finally(function() {
            console.log("pending pages list cleared");
        });;

    };
});
