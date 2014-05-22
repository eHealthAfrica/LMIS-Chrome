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
                if (!$window.navigator.onLine) {
                  var msg = generateSmsMsg(ccuBreakdownReport);
                  notificationService.sendSms(notificationService.alertRecipient, msg);
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