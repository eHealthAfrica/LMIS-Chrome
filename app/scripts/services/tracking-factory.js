'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
//need to design the priority queue bit based on the storage capacity restriction on the local storage and introduce a table for the lost records count

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($window, $rootScope, config, utility, syncService, storageService) {

            var tracker;


            if (utility.has($window, 'analytics')) {
                var service = $window.analytics.getService(config.analytics.service);
                tracker = service.getTracker(config.analytics.propertyID);
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
                            storageService.save(storageService.PAGE_VIEWS, _pageview);
                        console.log("offline page: "+page);
                        );

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
                        var _event = {
                            category: category,
                            action: action,
                            label: label
                        };
                        var clcks = storageService.CLICKS;
                        console.log("clicks: " + clcks);
                        storageService.save(storageService.CLICKS, _event);

                        }
                        );
            };

            //these will probably have to move elsewhere so that they can use the right tracker
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

