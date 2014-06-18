'use strict';

angular.module('lmisChromeApp')
  .factory('broadcastAlertFactory', function(storageService, $q, notificationService, syncService) {

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

    var getByUuid = function(uuid){
      return storageService.find(storageService.BROADCAST_ALERT, uuid);
    };

    var getAllBroadcastAlerts = function(){
      return storageService.all(storageService.BROADCAST_ALERT);
    };

    var getAllByType = function(type){
      var deferred = $q.defer();
      var typeAlertList = [];
      getAllBroadcastAlerts()
        .then(function(result){
          for(var i in result){
            var bcAlert = result[i];
            if(bcAlert.type === type){
              typeAlertList.push(bcAlert);
            }
          }
          deferred.resolve(typeAlertList);
        })
        .catch(function(reason){
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getMessage = function(bcAlert){
      var msg = {};
      if(bcAlert.type === TYPES.STOCK_OUT || bcAlert.type === TYPES.LOW_STOCK){
        msg = {
          uuid: bcAlert.uuid,
          facility: bcAlert.facility.uuid,
          productType: bcAlert.productType.uuid,
          stockLevel: bcAlert.stockLevel,
          created: bcAlert.created,
          type: bcAlert.type
        };
      }else if(bcAlert.type === TYPES.CCU_BREAKDOWN){
        msg = {
          uuid: bcAlert.uuid,
          facility: bcAlert.facility.uuid,
          dhis2_modelid: bcAlert.ccuProfile.dhis2_modelid,
          created: bcAlert.created,
          type: bcAlert.type
        };
      }

      return msg;
    };

    var sendAlert = function (bcAlert) {
      var deferred = $q.defer();
      var allowMultipleSync = true;
      syncService.syncItem(storageService.BROADCAST_ALERT, bcAlert, allowMultipleSync).
        then(function (result) {
          deferred.resolve(result);
        })
        .catch(function () {
         //sync failed send sms alert
          var msg = getMessage(bcAlert);
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


    return {
      getMessage: getMessage,
      types: TYPES,
      save: saveBroadcastAlert,
      get: getByUuid,
      getAll: getAllBroadcastAlerts,
      getAllByType: getAllByType,
      sendAlert: sendAlert
    };
  });