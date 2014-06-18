'use strict';

angular.module('lmisChromeApp').factory('stockOutBroadcastFactory', function (storageService, $q, syncService, $window, notificationService, inventoryRulesFactory, appConfigService) {

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
    var allowMultipleSync = true;
    syncService.syncItem(storageService.STOCK_OUT, stockOut, allowMultipleSync).
        then(function (result) {
          deferred.resolve(result);
        })
        .catch(function () {
          //sync failed send sms alert
          var msg = {
            uuid:stockOut.uuid,
            facility: stockOut.facility.uuid,
            productType: stockOut.productType.uuid,
            stockLevel: stockOut.stockLevel,
            created: stockOut.created
          };
          notificationService.sendSms(notificationService.alertRecipient, msg, 'stock_out')
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

  var addStockLevelAndSave = function(stockOut){
    var deferred = $q.defer();
    var processSaveStockOut = function (stkOut) {
      saveStockOut(stkOut)
          .then(function (result) {
            stkOut.uuid = result;
            deferred.resolve(stkOut);
          })
          .catch(function(reason){
            deferred.reject(reason);
          });
    };
    inventoryRulesFactory.getStockLevel(stockOut.facility, stockOut.productType)
        .then(function(stockLevel){
          stockOut.stockLevel = stockLevel;
          processSaveStockOut(stockOut);
        })
        .catch(function(){
          processSaveStockOut(stockOut);
        });
    return deferred.promise;
  };

  return {
    save: saveStockOut,
    saveBatch: saveMultipleStockOut,
    getAll: getStockOut,
    broadcast: broadcastStockOut,
    addStockLevelAndSave: addStockLevelAndSave
  };

});
