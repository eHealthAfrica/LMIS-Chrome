'use strict';

angular.module('lmisChromeApp')
  .factory('broadcastAlertFactory', function(storageService, $q) {

    var TYPES = {
      CCU_BREAKDOWN: 0,
      STOCK_OUT: 1,
      LOW_STOCK: 2
    };

    var saveBroadcastAlert = function(broadcastAlert){
      var deferred = $q.defer();
      storageService.save(storageService.BROADCAST_ALERT, broadcastAlert)
        .then(function(result){
          broadcastAlert.uuid = result;
          deferred.resolve(broadcastAlert);
        })
        .catch(function(reason){
          deferred.reject(reason);
        });
      return deferred.promise;
    };


    return {
      types: TYPES,
      save: saveBroadcastAlert
    };
  });