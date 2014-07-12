'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
//need to design the priority queue bit based on the storage capacity restriction on the local storage and introduce a table for the lost records count

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($q, $window, $rootScope, config, utility, deviceInfoFactory, storageService, pouchStorageService) {

            var tracker;

            var events_limit = config.analytics.events_limit;
            var exceptions_limit = config.analytics.exceptions_limit;
            var pages_limit = config.analytics.pages_limit;

            if (utility.has($window, 'analytics')) {
                var service = $window.analytics.getService(config.analytics.service);
                tracker = service.getTracker(config.analytics.propertyID);
            }

            var updateLostRecords = function(table, localObject, removed, event, size) {
                //table data object
                var newObject;

                if (size === 0) {
                    newObject = {
                        clicks: 0,
                        exceptions: 0,
                        pages: 0
                    };
                    return storageService.save(table, newObject)
                } else {
                    newObject = {
                        clicks: localObject.clicks,
                        exceptions: localObject.exceptions,
                        pages: localObject.pages
                    };
                }
                if (event === 0)
                    newObject.clicks += removed;
                if (event === 1)
                    newObject.pages += removed;
                if (event === 2)
                    newObject.exceptions += removed;

                storageService.compact(table)
                return storageService.removeRecord(table, localObject.uuid).then(function() {
                    storageService.save(table, newObject)
                });
            }

            var removeExcessRecords = function(table, limit) {

                var uuids = [];
                var sizes = [];
                var toDelete = [];
                var deferred = $q.defer();

                storageService.all(table).then(function(tableData) {
                    tableData.forEach(function(data) {
                        var count = JSON.stringify(data).length;
                        uuids.push(data.uuid);
                        sizes.push(count);
                    });
                }).catch(function(reason) {
                    //cathc exception
                }).then(function() {
                    var total = 0;
                    for (var i = 0; i < uuids.length; i++) {
                        if (total > limit) {
                            toDelete.push(uuids[i]);
                        } else {
                            total += sizes[i];
                        }
                    }
                    storageService.removeRecords(table, toDelete);
                    deferred.resolve(toDelete.length);
                });
                pouchStorageService.compact(table);
                return deferred.promise;
            };


            var event = function(category, action, label) {

                deviceInfoFactory.canConnect()
                        .then(function() {
                            tracker.sendEvent(category, action, label);
                        })
                        .catch(function(reason) {
                            var _event = {
                                action: action,
                                label: label
                            };
                            storageService.save(storageService.CLICKS, _event);
                            removeExcessRecords(storageService.CLICKS, events_limit).then(function(removed) {
                                storageService.all(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
                                    updateLostRecords(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0], removed, 0, lostRecords.length);
                                });

                            });
                        });
            };

            var appView = function(page) {
                deviceInfoFactory.canConnect()
                        .then(function() {
                            tracker.sendAppView(page);
                        })
                        .catch(function(reason) {
                            var _pageview = {
                                page: page
                            };
                            storageService.save(storageService.PAGEVIEWS, _pageview);
                            removeExcessRecords(storageService.PAGEVIEWS, pages_limit).then(function(removed) {
                                storageService.get(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
                                    updateLostRecords(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0], removed, 1, lostRecords.length);
                                });

                            });
                        });
            };

            var exception = function(opt_description, opt_fatal) {
                deviceInfoFactory.canConnect()
                        .then(function() {
                            tracker.sendException(opt_description, opt_fatal);
                        })
                        .catch(function(reason) {
                            var _exception = {
                                opt_description: opt_description,
                                opt_fatal: opt_fatal
                            };
                            storageService.save(storageService.EXCEPTIONS, _exception);
                            removeExcessRecords(storageService.EXCEPTIONS, exceptions_limit).then(function(removed) {
                                storageService.all(storageService.ANALYTICS_LOST_RECORDS).then(function(lostRecords) {
                                    updateLostRecords(storageService.ANALYTICS_LOST_RECORDS, lostRecords[0], removed, 2, lostRecords.length);
                                });
                            });
                        });
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
