'use strict';

angular.module('lmisChromeApp')
    .factory('ccuBreakdownFactory', function ($q, storageService, syncService) {

      var saveCcuBreakdownReport = function(ccuBreakdownReport){
        return storageService.save(storageService.CCU_BREAKDOWN, ccuBreakdownReport);
      };

      var saveAndSendCcuBreakdownReport = function(ccuBreakdownReport){
        var deferred = $q.defer();
        //TODO: what should be done if the device is offline, SMS???
        saveCcuBreakdownReport(ccuBreakdownReport)
            .then(function(result){
              if(typeof result !== 'undefined'){
                ccuBreakdownReport['uuid'] = result;
                syncService.syncItem(storageService.CCU_BREAKDOWN, ccuBreakdownReport)
                    .then(function (syncResult) {
                      console.log('ccu breakdown as synced successfully ' + syncResult);
                    }).catch(function (reason) {
                      console.log('ccu breakdown syncing failed: ' + reason);
                    });
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