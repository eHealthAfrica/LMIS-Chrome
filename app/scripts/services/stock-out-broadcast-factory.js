'use strict';

angular.module('lmisChromeApp').factory('stockOutBroadcastFactory', function(storageService, $q, $log, syncService, $window) {
  var saveStockOut = function(stockOut){
    var deferred = $q.defer();
    storageService.save(storageService.STOCK_OUT, stockOut).then(function(result){
      deferred.resolve(result);
    })
    .catch(function(reason){
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  var broadcastStockOut = function(stockOut){
    var deferred = $q.defer();
    var stockOutModel = {
      uuid: stockOut.uuid,
      facility: stockOut.facility.uuid,
      productType: stockOut.productType.uuid,
      created: stockOut.created,
      modified: stockOut.modified
    };

    try{
      if($window.navigator.onLine){
        syncService.syncItem(storageService.STOCK_OUT, stockOutModel)
          .then(function (result) {
            deferred.resolve(result);
          })
          .catch(function (reason) {
            deferred.reject(reason);
          });

      }else{
        //TODO: send SMS if offline
        deferred.reject('system is offline, send SMS!');
      }
    }catch(e){
      deferred.reject(e);
    }
    return deferred.promise;
  };

  var getStockOut = function(){
    var deferred = $q.defer();
    storageService.all(storageService.STOCK_OUT).then(function(result){
      deferred.resolve(result);
    });
    return deferred.promise;
  };

  return {
    save: saveStockOut,
    getAll: getStockOut,
    broadcast: broadcastStockOut
  };

});
