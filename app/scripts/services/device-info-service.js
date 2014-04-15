'use strict';

angular.module('lmisChromeApp')
  .service('deviceInfoService', function($q, $rootScope, $window) {

    this.getDeviceInfo = function(){
      var deferred = $q.defer();
      if ('cordova' in $window) {
        var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
        deviceInfo.get(function (result) {
          $rootScope.$apply(function(){
            deferred.resolve(result);
          });
        }, function (reason) {
          $rootScope.$apply(function(){
            deferred.reject(reason);
          });
        });
      }else{
        deferred.reject('cordova not supported!');
      }
      return deferred.promise;
    };

  });
