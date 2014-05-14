'use strict';

angular.module('lmisChromeApp')
  .service('deviceInfoService', function($q, $window) {

    this.NOT_SUPPORTED_MSG = 'cordova not supported on this device!';

    this.getDeviceInfo = function(){
      var deferred = $q.defer();

      if ('cordova' in $window) {
        var deviceInfo = cordova.require('cordova/plugin/DeviceInformation');
        deviceInfo.get(function (result) {
          var emailList = result.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi).join(',');
          var mainEmail = emailList.split(',')[0];//return first email as main email.
          deferred.resolve({mainAccount: mainEmail});
        }, function (reason) {
          deferred.resolve(reason);
        });
      }else{
        deferred.resolve(this.NOT_SUPPORTED_MSG);
      }

      return deferred.promise;
    };

  });
