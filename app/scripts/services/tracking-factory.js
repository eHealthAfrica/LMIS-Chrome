'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
//need to design the priority queue bit based on the storage capacity restriction on the local storage and introduce a table for the lost records count

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($window, $rootScope, config,utility, deviceInfoFactory, storageService) {

angular.module('lmisChromeApp')
        .factory('trackingFactory', function($window, $rootScope, config, utility, deviceInfoFactory, storageService) {

            var tracker;
            var online;
            if (utility.has($window, 'analytics')) {
                var service = $window.analytics.getService(config.analytics.service);
                online = deviceInfoFactory.isOnline();
                tracker = online ? service.getTracker(config.analytics.propertyID) : {
                    sendAppView: function(page) {
                        console.log("offline page: " + page);
                        var _pageview = {
                            page: page
                        };
                        storageService.save(storageService.PAGE_VIEWS, _pageview);
                    },
                    sendException: function(opt_description, opt_fatal) {
                        console.log("offline exception : " + opt_description + ": " + opt_fatal);
                        var _exception = {
                            opt_description: opt_description,
                            opt_fatal: opt_fatal
                        };
                        storageService.save(storageService.EXCEPTIONS, _exception);
                    },
                    sendEvent: function(category, action, label) {
                        console.log("offline click : " + category + ": " + action + ": " + label);
                        var _event = {
//                            category: category,
                            action: action,
                            label: label
                        };
                        storageService.save(storageService.CLICKS, _event);
                    }

                };
                $rootScope.$on('$stateChangeSuccess', function(state) {
                    tracker.sendAppView(state.name);
                });

                $rootScope.$on('$stateNotFound', function(state) {
                    tracker.sendException(state.to, false);
                });
            }

            return {
                tracker: tracker,
                online: online
            };
        });
