'use strict';

//ok so here we need to overload sendAppView, sendException and sendEvent to write on local storage (JSON)
//use local storage or couchdb service to store hits temporarilly
angular.module('lmisChromeApp')
        .factory('trackingFactory', function($window, $rootScope, config, deviceInfoFactory) {

            var tracker;
            if ('analytics' in $window) {
                var service = $window.analytics.getService(config.analytics.service);

                tracker = (deviceInfoFactory.isOnline()) ? service.getTracker(config.analytics.propertyID) : {
                    sendAppView: function(page) {
                        console.log("offline page: "+page);
                    },
                    sendException: function(opt_description, opt_fatal) {
                        console.log("offline exception : "+opt_description +": " + opt_fatal);
                    },
                    sendEvent: function(category, action, label){
                        console.log("offline click : "+category +": " + action + ": " + label);
                    }

                }
                $rootScope.$on('$stateChangeSuccess', function( state) {
                    tracker.sendAppView(state.name);
                });

                $rootScope.$on('$stateNotFound', function(state) {
                    tracker.sendException(state.to, false);
                });
            }
            

            

            return {
                tracker: tracker
            };
        });
