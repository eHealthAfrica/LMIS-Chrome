'use strict';

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($q, $window, $rootScope, config, utility, deviceInfoFactory, storageService, pouchStorageService, appConfigService) {

            var tracker;

            var events_limit = config.analytics.events_limit;
            var exceptions_limit = config.analytics.exceptions_limit;
            var pages_limit = config.analytics.pages_limit;

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
//                appConfigService.getCurrentAppConfig()
//                        .then(setUUID);
            }


            var updateLostRecords = function(table, localObject, removed, size) {
                //table data object
                var newObject = (size === 0) ? {records: 0} : {records: localObject.records};

//                if(size !==0){
//                console.log("===================== table: " + table + " ==================================");
//                console.log(localObject.uuid + ": " + newObject.records + "::" + localObject.records);
//                console.log("=======================updated================================");
//                }
                newObject.records += removed;
                storageService.compact(table);

//                if(size !==0){
//                console.log(localObject.uuid + ": " + newObject.records + "::" + localObject.records);
//                console.log("=======================end================================");
//            }
                return (size === 0) ? storageService.save(table, newObject) : storageService.removeRecord(table, localObject.uuid).then(function() {
                    storageService.save(table, newObject);
                });
            };

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
                                if (removed > 0)
                                    storageService.all(storageService.ANALYTICS_LOST_CLICKS).then(function(lostRecords) {
                                        updateLostRecords(storageService.ANALYTICS_LOST_CLICKS, lostRecords[0], removed, lostRecords.length);
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
                                if (removed > 0)
                                    storageService.get(storageService.ANALYTICS_LOST_PAGEVIEWS).then(function(lostRecords) {
                                        updateLostRecords(storageService.ANALYTICS_LOST_PAGEVIEWS, lostRecords[0], removed, lostRecords.length);
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
                                if (removed > 0)
                                    storageService.all(storageService.ANALYTICS_LOST_EXCEPTIONS).then(function(lostRecords) {

                                        updateLostRecords(storageService.ANALYTICS_LOST_EXCEPTIONS, lostRecords[0], removed, lostRecords.length);
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
