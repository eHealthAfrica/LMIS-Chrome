'use strict';

angular.module('lmisChromeApp')
  .factory('deviceInfoFactory', function($q, $window) {
    return {
      getDeviceInfo: function() {
        var deferred = $q.defer();

        if(!('cordova' in $window)) {
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
      }
    };
  });
