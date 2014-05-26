'use strict';

angular.module('lmisChromeApp')
    .factory('ccuBreakdownFactory', function ($q, storageService, syncService, $window, notificationService) {

      var saveCcuBreakdownReport = function(ccuBreakdownReport){
        return storageService.save(storageService.CCU_BREAKDOWN, ccuBreakdownReport);
      };

      var generateSmsMsg = function(ccuBreakdownReport){
        var msg = 'ccuBrk:'+ccuBreakdownReport.uuid+';'+'fac:'+ccuBreakdownReport.facility.uuid+
            ';ccuId:'+ccuBreakdownReport.ccuProfile.dhis2_modelid;
        return msg;
      };

      var saveAndSendCcuBreakdownReport = function(ccuBreakdownReport){
        var deferred = $q.defer();
        saveCcuBreakdownReport(ccuBreakdownReport)
            .then(function(result){
              if (typeof result !== 'undefined') {
                ccuBreakdownReport.uuid = result;
                //broadcast CCU breakdown report in the background
                if (!$window.navigator.onLine) {
                  var msg = generateSmsMsg(ccuBreakdownReport);
                  //TODO: abstract this to a syncService function that sends sms if device is offline and update pending sync list
                  var smsPromise = notificationService.sendSms(notificationService.alertRecipient, msg);
                  var pendingSyncRecord = { dbName: storageService.CCU_BREAKDOWN, uuid: ccuBreakdownReport.uuid };
                  smsPromise.finally(function () {
                    //update pending sync record in the background
                    storageService.save(storageService.PENDING_SYNCS, pendingSyncRecord);
                  });
                }else{
                  syncService.syncItem(storageService.CCU_BREAKDOWN, ccuBreakdownReport)
                      .then(function (syncResult) {
                        console.log('ccu breakdown as synced successfully ' + syncResult);
                      }).catch(function (reason) {
                        console.log(reason);
                      });
                }
              }
              deferred.resolve(result);
            }).catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      return {
        save: saveCcuBreakdownReport,
        saveAndSendReport: saveAndSendCcuBreakdownReport
      };

    });