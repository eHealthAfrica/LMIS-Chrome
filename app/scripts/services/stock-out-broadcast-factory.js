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

    if ($window.navigator.onLine) {
      return syncService.syncItem(storageService.STOCK_OUT, stockOut);
    } else {
      var msg = 'stkOut:'+stockOut.uuid+';facility:'+stockOut.facility.uuid+';prodType:'+stockOut.productType.uuid;
      var smsPromise = notificationService.sendSms(notificationService.alertRecipient, msg);
      var pendingSyncRecord = { dbName: storageService.STOCK_OUT, uuid: so.uuid };
      smsPromise.finally(function(){
        //update pending sync record in the background
        syncService.addToPendingSync(pendingSyncRecord);
      });
      return smsPromise;
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
    storageService.all(storageService.STOCK_OUT)
        .then(function (result) {
          deferred.resolve(result);
        })
        .catch(function(reason){
          deferred.reject(reason);
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
