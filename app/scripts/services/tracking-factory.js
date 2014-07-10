'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
//need to design the priority queue bit based on the storage capacity restriction on the local storage and introduce a table for the lost records count

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($q, $window, $rootScope, config, utility, syncService, storageService) {

            var tracker;

            var events_limit = config.analytics.events_limit;
            var exceptions_limit = config.analytics.exceptions_limit;
            var pages_limit = config.analytics.pages_limit;

            if (utility.has($window, 'analytics')) {
                var service = $window.analytics.getService(config.analytics.service);
                tracker = service.getTracker(config.analytics.propertyID);
            }

            var removeExcessRecords = function(table, limit) {

                var uuids = [];
                var sizes = [];
                var toDelete = [];
                var deferred = $q.defer();

                storageService.all(table).then(function(tableData) {

                    tableData.forEach(function(data) {

                        var count = JSON.stringify(data).length;
                        console.log(table + ": " + count)
                        uuids.push(data.uuid);
                        sizes.push(count);

                    });

                }).catch(function(reason) {

                }).then(function() {
                    var total = 0;
                    for (var i = 0; i < uuids.length; i++) {

                        if (total > limit) {
                            toDelete.push(uuids[i])
                        } else {
                            total += sizes[i];
                        }
                    }
                    console.log(table + ": " + total)
                    console.log("deleting: "+ toDelete.length)
                    storageService.removeRecords(table, toDelete);
                    deferred.resolve(toDelete.length);
                })
                return deferred.promise;
            }


            var event = function(category, action, label) {

                syncService.canConnect()
                        .then(function() {
                            tracker.sendEvent(category, action, label);
                        })
                        .catch(function(reason) {
                            console.log("offline click : " + category + ": " + action + ": " + label + " reason: " + reason);
                            var _event = {
                                action: action,
                                label: label
                            };
                            storageService.save(storageService.CLICKS, _event);
                            removeExcessRecords(storageService.CLICKS, events_limit).then(function(removed) {
//                                storageService.all(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
//                                    console.log("removed: " + removed);
//                                    lostRecords[0].events += removed;
//                                    console.log("lrs: "+ lostRecords[0].events)
//                                    storageService.removeRecord(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0].uuid)
//                                    storageService.insertData(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0])
//
//                                });

                            });
                        }
                        );
            };


            var appView = function(page) {
                syncService.canConnect()
                        .then(function() {
                            tracker.sendAppView(page);
                        })
                        .catch(function(reason) {
                            console.log("offline page: " + page);
                            var _pageview = {
                                page: page
                            };
                            storageService.save(storageService.PAGEVIEWS, _pageview);
                            removeExcessRecords(storageService.PAGEVIEWS, pages_limit).then(function(removed) {
//                                storageService.get(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
//                                    console.log("removed: " + removed);
//                                    console.log("lost_recs: " + lostRecords);
//                                    console.log("lost_recs: " + lostRecords.length);
//                                    lostRecords[0].pages += removed;
//                                    storageService.removeRecord(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0].uuid)
//                                    storageService.insertData(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0])
//
//                                });

                            });
                        });

            };

            var exception = function(opt_description, opt_fatal) {

                syncService.canConnect()
                        .then(function() {
                            tracker.sendException(opt_description, opt_fatal);
                        })
                        .catch(function(reason) {

                            console.log("offline exception : " + opt_description + ": " + opt_fatal);
                            var _exception = {
                                opt_description: opt_description,
                                opt_fatal: opt_fatal
                            };
                            storageService.save(storageService.EXCEPTIONS, _exception);
                            removeExcessRecords(storageService.EXCEPTIONS, exceptions_limit).then(function(removed) {
//                                storageService.all(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
//                                    lostRecords[0].exceptions += removed;
//                                    storageService.removeRecord(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0].uuid)
//                                    storageService.insertData(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0])
//                                });
                            });
                        }
                        );
            };

            $rootScope.$on('$stateChangeSuccess', function(state) {
                appView(state.name);
            });

            $rootScope.$on('$stateNotFound', function(state) {
                exception(state.to, false);
            });

            return {
                tracker: tracker,
                postEvent: event,
                postAppView: appView,
                postException: exception

            };
        });
