'use strict';

angular.module('lmisChromeApp')
    .factory('ccuFactory', function ($q, appConfigService, storageService) {

      var CCU_STATUS_LIST = {
        NEEDS_REVIEW: 0,
        NOT_WORKING: 1,
        IN_REPAIR: 2,
        WORKING: 3
      };

      function getByUuid(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.CCU, uuid).then(function (storageUnit) {
          //TODO: attach nested storageUnit objects
          deferred.resolve(storageUnit);
        });
        return deferred.promise;
      };

      var getCcuListByFacility = function (facilityUUID) {
        var deferred = $q.defer(), facilityCcuList = [];
        storageService.all(storageService.CCU).then(function (data) {
          for(var index in data){
            var ccu = data[index];
            if(ccu.facility === facilityUUID){
              facilityCcuList.push(getByUuid(ccu.uuid));
            }
          }

          $q.all(facilityCcuList).then(function(ccuList){
            deferred.resolve(ccuList);
          })
          .catch(function(reason){
            deferred.reject(reason);
          });

        });
        return deferred.promise;
      };

      var getCurrentFacilityCcuList = function () {
        var deferred = $q.defer();
        appConfigService.getCurrentAppConfig().then(function (appConfig) {
          if(typeof appConfig === 'undefined'){
            throw 'appConfig is not defined';
          }
          var facilityUuid = appConfig.appFacility.uuid;
          if(typeof facilityUuid === 'undefined'){
            throw 'current facility uuid is not defined'
          }

          getCcuListByFacility(facilityUuid)
            .then(function (storageUnits) {
              deferred.resolve(storageUnits);
            })
            .catch(function(reason){
              deferred.reject(reason);
          });

        }).catch(function(reason){
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      var getAll = function(){
        var deferred = $q.defer();
        var completeCcuList = [];
        storageService.all(storageService.CCU)
          .then(function(ccuList){
            for(var index in ccuList){
              completeCcuList.push(getByUuid(ccuList[index].uuid))
            }

            $q.all(completeCcuList)
              .then(function(result){
                deferred.resolve(result);
              })
              .catch(function(reason){
                deferred.reject(reason);
              });
          })
          .catch(function(reason){
            deferred.reject(reason);
          })
        return deferred.promise;
      };

      return {
        getCurrentFacilityCcuList: getCurrentFacilityCcuList,
        getCcuListByFacility: getCcuListByFacility,
        get: getByUuid,
        STATUS_LIST: CCU_STATUS_LIST
      };

    });