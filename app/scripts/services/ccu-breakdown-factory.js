'use strict';

angular.module('lmisChromeApp')
    .factory('ccuBreakdownFactory', function ($q, storageService, syncService, $window, notificationService,$http, kcContactService) {

      var saveCcuBreakdownReport = function (ccuBreakdown) {
        var deferred = $q.defer();
        storageService.save(storageService.CCU_BREAKDOWN2, ccuBreakdown)
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
          dhis2_modelid: ccuBreakdown.ccuProfile.dhis2_modelid,
          created: ccuBreakdown.created
        };
        return msg;
      };

      var broadcastCcuBreakdown = function (ccuBreakdown) {
        var deferred = $q.defer();
        syncService.syncUpRecord(storageService.CCU_BREAKDOWN2, ccuBreakdown)
            .then(function (syncResult) {
              sendSms();
              deferred.resolve(syncResult);
            }).catch(function () {
              //online syncing failed, send offline sms alert.
              sendSms();
            });
        function sendSms (){
          var msg = generateSmsMsg(ccuBreakdown);
          //TODO: the position should be dynamic incase other officers need to receive the alert too.
          var reciepient = kcContactService.get(ccuBreakdown.facility.name, 'Cold Chain Officer');
          notificationService.sendSms(notificationService.countryCode + reciepient.phone, msg, 'ccu_breakdown')
            .then(function (smsResult) {
              deferred.resolve(smsResult);
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        }
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
      var getAll = function(){
          return storageService.all(storageService.CCU_BREAKDOWN2)
      }
      return {
        save: saveCcuBreakdownReport,
        broadcast: broadcastCcuBreakdown,
        saveAndSendReport: saveAndSendCcuBreakdownReport,
        getAll: getAll
      };

    });