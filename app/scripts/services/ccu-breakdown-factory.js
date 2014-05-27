'use strict';

angular.module('lmisChromeApp')
    .factory('ccuBreakdownFactory', function ($q, storageService, syncService, $window, notificationService) {

      var saveCcuBreakdownReport = function (ccuBreakdownReport) {
        return storageService.save(storageService.CCU_BREAKDOWN, ccuBreakdownReport);
      };

      var generateSmsMsg = function (ccuBreakdownReport) {
        var msg = 'ccuBrk:' + ccuBreakdownReport.uuid + ';' + 'fac:' + ccuBreakdownReport.facility.uuid +
            ';ccuId:' + ccuBreakdownReport.ccuProfile.dhis2_modelid;
        return msg;
      };

      var saveAndSendCcuBreakdownReport = function (ccuBreakdownReport) {
        var deferred = $q.defer();
        saveCcuBreakdownReport(ccuBreakdownReport)
            .then(function () {
              syncService.syncItem(storageService.CCU_BREAKDOWN, ccuBreakdownReport)
                  .then(function (syncResult) {
                    deferred.resolve(syncResult);
                  }).catch(function () {
                    //online syncing failed, send offline sms alert.
                    var msg = generateSmsMsg(ccuBreakdownReport);
                    notificationService.sendSms(notificationService.alertRecipient, msg)
                        .then(function (result) {
                          deferred.resolve(result);
                        })
                        .catch(function (smsError) {
                          deferred.reject(smsError);
                        });
                  });
            }).catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      return {
        save: saveCcuBreakdownReport,
        saveAndSendReport: saveAndSendCcuBreakdownReport
      };

    });