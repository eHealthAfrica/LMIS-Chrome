'use strict';

angular.module('lmisChromeApp')
  .factory('deviceInfoFactory', function($q, $window, utility, $interval, pouchStorageService) {
    var THIRTY_SECS_DELAY = 30 * 1000;
    var MAX_CONNECTION_ATTEMPT = 5;

    /**
     * This returns true if successful, else rejects with reason for failure.
     *
     * @returns {promise|Function|promise|promise|promise|*}
     */
    var canConnect = function() {
      var deferred = $q.defer();
      var testDb = 'connection_test';
      var counter = 0;
      var reason;
      if (!$window.navigator.onLine) {
        reason = 'device is not online, check your internet connection settings.';
        deferred.reject(reason);
      } else {
        var syncRequest = $interval(function() {
          if (counter < MAX_CONNECTION_ATTEMPT) {
            try {
              var remoteDb = pouchStorageService.getRemoteDB(testDb);
              remoteDb.info()
                .then(function() {
                  $interval.cancel(syncRequest);//free $interval to avoid memory leak
                  deferred.resolve(true);
                  counter = MAX_CONNECTION_ATTEMPT;
                })
                .catch(function(conError) {
                  reason = conError;
                  counter = counter + 1;
                });
            } catch (e) {
              reason = e;
              counter = counter + 1;
            }
          } else {
            deferred.reject(reason);//couldn't establish connection
            $interval.cancel(syncRequest);//free $interval to avoid memory leak
          }
        }, THIRTY_SECS_DELAY);
      }
      return deferred.promise;
    };

    return {
      getDeviceInfo: function() {
        var deferred = $q.defer();

        if(!utility.has($window, 'cordova')) {
          deferred.reject('Cordova is not supported on this device.');
          return deferred.promise;
        }

        var deviceInfo = $window.cordova.require('cordova/plugin/DeviceInformation');

        var success = function(result) {
          var pattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
          var emails = result.match(pattern);

          if(emails && emails.length) {
            deferred.resolve({ mainAccount: emails[0] });
          } else {
            deferred.reject('No device emails found');
          }

        };

        var failure = function(reason) {
          deferred.reject(reason);
        };

        deviceInfo.get(success, failure);
        return deferred.promise;
      },

      isOnline: function(){
        return $window.navigator.onLine;
      },

      canConnect: canConnect
    };
  });
