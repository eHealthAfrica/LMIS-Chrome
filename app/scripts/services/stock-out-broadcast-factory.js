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

  /**
   * This function tries to sync stock-out alert if it fails, it sends sms alert.
   * NB: syncItem updates pending sync record if sync fails #see syncService.syncItem for more detail.
   *
   * @param stockOut
   * @returns {promise|Function|promise|promise|promise|*}
   */
  var broadcastStockOut = function (stockOut) {
    var deferred = $q.defer();
    syncService.syncItem(storageService.STOCK_OUT, stockOut).
        then(function (result) {
          deferred.resolve(result);
        })
        .catch(function (reason) {
          //sync failed send sms alert
          var msg = 'stkOut:' + stockOut.uuid + ';facility:' + stockOut.facility.uuid + ';prodType:' +
              stockOut.productType.uuid;
          notificationService.sendSms(notificationService.alertRecipient, msg)
              .then(function (result) {
                deferred.resolve(result);
              })
              .catch(function (reason) {
                deferred.reject(reason);
              });
        });
    return deferred.promise;
  };

  var saveMultipleStockOut = function (stockOutList) {
    var deferred = $q.defer();
    storageService.insertBatch(storageService.STOCK_OUT, stockOutList)
        .then(function (result) {
          deferred.resolve(result);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    return deferred.promise;
  };

  var getStockOut = function () {
    var deferred = $q.defer();
    storageService.all(storageService.STOCK_OUT)
        .then(function (result) {
          deferred.resolve(result);
        })
        .catch(function (reason) {
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
