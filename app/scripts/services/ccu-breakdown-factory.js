'use strict';

angular.module('lmisChromeApp')
    .factory('ccuBreakdownFactory', function ($q, storageService, syncService, $window, notificationService) {

      var saveCcuBreakdownReport = function (ccuBreakdown) {
        var deferred = $q.defer();
        storageService.save(storageService.CCU_BREAKDOWN, ccuBreakdown)
            .then(function (result) {
              if (typeof result !== 'undefined') {
                ccuBreakdown.uuid = result;
                deferred.resolve(ccuBreakdown);
              } else {
                deferred.reject('result is undefined.');
              }
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      var generateSmsMsg = function (ccuBreakdown) {
        var msg = {
          uuid: ccuBreakdown.uuid,
          facility: ccuBreakdown.facility.uuid,
          dhis2_modelid: ccuBreakdown.ccuProfile.dhis2_modelid
        };
        return msg;
      };

      var broadcastCcuBreakdown = function (ccuBreakdown) {
        var deferred = $q.defer();
        var allowMultipleSync = true;
        syncService.syncItem(storageService.CCU_BREAKDOWN, ccuBreakdown, allowMultipleSync)
            .then(function (syncResult) {
              deferred.resolve(syncResult);
            }).catch(function () {
              //online syncing failed, send offline sms alert.
              var msg = generateSmsMsg(ccuBreakdown);
              notificationService.sendSms(notificationService.alertRecipient, msg, 'ccu_breakdown')
                  .then(function (smsResult) {
                    deferred.resolve(smsResult);
                  })
                  .catch(function (reason) {
                    deferred.reject(reason);
                  });
            });
        return deferred.promise;
      };

      var saveAndSendCcuBreakdownReport = function (ccuBreakdown) {
        var deferred = $q.defer();
        saveCcuBreakdownReport(ccuBreakdown)
            .then(function(result){
              broadcastCcuBreakdown(result)
                  .then(function(broadcastResult){
                    deferred.resolve(broadcastResult);
                  })
                  .catch(function(reason){
                    deferred.reject(reason);
                  });
            })
            .catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      return {
        save: saveCcuBreakdownReport,
        broadcast: broadcastCcuBreakdown,
        saveAndSendReport: saveAndSendCcuBreakdownReport
      };

    });