'use strict';

angular.module('lmisChromeApp').service('analyticsSyncService', function($q, storageService, trackingFactory) {


    var tracker = trackingFactory.tracker;
    this.syncClicks = function() {
        var uuids = [];
        console.log("Loopin")
        storageService.all(storageService.CLICKS).then(function(clicksData) {
            clicksData.forEach(function(click) {

                console.log("uuid: " + click.uuid);
                console.log("online: " + trackingFactory.online);
                if (trackingFactory.online) {

                    //best to get a success flag here and delete if event successfuly sent
                    tracker.sendEvent("Offline Clicks", click.action, click.label);
                    console.log(tracker.sendEvent("Offline Clicks", click.action, click.label));
                    uuids.push(click.uuid);

                }
            });
        }).finally(function() {
            console.log("pending list cleared (i wish!)");
        });

        console.log("uuids: " + uuids.length);
        var deferred = $q.defer();
        storageService.removeRecords(storageService.CLICKS, uuids)
                .then(function() {
                    deferred.resolve();
                })
                .catch(function() {
                    deferred.reject();
                });
    };

    //not final yet. Work in progress
    this.syncExceptions = function() {

        var uuids = [];
        console.log("Loopin Excepts")

        storageService.all(storageService.EXCEPTIONS).then(function(exceptionData) {
            exceptionData.forEach(function(exception) {

                console.log("uuid: " + exception.uuid);
                console.log("online: " + trackingFactory.online);
                if (trackingFactory.online) {

                    //best to get a success flag here and delete if event successfuly sent
                    tracker.sendEvent(exception.opt_description, exception.opt_fatal);
                    console.log(tracker.sendEvent("Offline excepts", exception.opt_description, exception.opt_fatal));
                    uuids.push(exception.uuid);

                }
            });

            console.log("uuids: " + uuids.length);
            var deferred = $q.defer();
            storageService.removeRecords(storageService.EXCEPTIONS, uuids)
                    .then(function() {
                        deferred.resolve();
                    })
                    .catch(function() {
                        deferred.reject();
                    });


        }).finally(function() {
            console.log("pending list cleared (i wish!)");
        });

    };

    //not final yet. Worki in progress
    this.syncPageViews = function() {

        
        var uuids = [];
        console.log("Loopin Excepts")

        storageService.all(storageService.PAGE_VIEWS).then(function(pageViewData) {
            pageViewData.forEach(function(pageView) {

                console.log("uuid: " + pageView.uuid);
                console.log("online: " + trackingFactory.online);
                if (trackingFactory.online) {

                    //best to get a success flag here and delete if event successfuly sent
                    tracker.sendAppView(pageView.page);
                    console.log(tracker.sendEvent("Offline views", pageView.page));
                    uuids.push(pageView.uuid);

                }
            });

            console.log("uuids: " + uuids.length);
            var deferred = $q.defer();
            storageService.removeRecords(storageService.EXCEPTIONS, uuids)
                    .then(function() {
                        deferred.resolve();
                    })
                    .catch(function() {
                        deferred.reject();
                    });


        }).finally(function() {
            console.log("pending list cleared (i wish!)");
        });
        
    };
});
