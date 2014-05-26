'use strict';

angular.module('lmisChromeApp').factory('stockOutBroadcastFactory', function (storageService, $q, syncService, $window, notificationService) {

  var saveStockOut = function (stockOut) {
    var deferred = $q.defer();
    storageService.save(storageService.STOCK_OUT, stockOut)
        .then(function (result) {
          deferred.resolve(result);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    return deferred.promise;
  };

  var broadcastStockOut = function (stockOut) {
    var so = {
      uuid: stockOut.uuid,
      facility: stockOut.facility.uuid,
      productType: stockOut.productType.uuid,
      created: stockOut.created,
      modified: stockOut.modified
    };

    if ($window.navigator.onLine) {
      return syncService.syncItem(storageService.STOCK_OUT, so);
    } else {
      var msg = 'stkOut:'+so.uuid+';fac:'+so.facility+';prodtype:'+so.productType;
      notificationService.sendSms(notificationService.alertRecipient, msg);
    }

  };

  var saveMultipleStockOut = function(stockOutList){
    var deferred = $q.defer();
    storageService.insertBatch(storageService.STOCK_OUT, stockOutList)
      .then(function(result){
        deferred.resolve(result);
      })
      .catch(function(reason){
        deferred.reject(reason);
      });
    return deferred.promise;
  };

  var getStockOut = function(){
    var deferred = $q.defer();
    storageService.all(storageService.STOCK_OUT).then(function (result) {
      deferred.resolve(result);
    });
    return deferred.promise;
  };

  return {
    save: saveStockOut,
    saveBatch: saveMultipleStockOut,
    getAll: getStockOut,
    broadcast: broadcastStockOut
  };

});
