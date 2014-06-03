'use strict';

angular.module('lmisChromeApp').factory('ccuProfileFactory', function ($q, storageService) {

  var getByModelId = function (modelId) {
    var deferred = $q.defer();
    storageService.get(storageService.CCU_PROFILE)
        .then(function (ccuProfile) {
          deferred.resolve(ccuProfile[modelId]);
        })
        .catch(function(reason){
          deferred.reject(reason);
        });
    return deferred.promise;
  };

  var getCcuProfiles = function () {
    var deferred = $q.defer();

    storageService.all(storageService.CCU_PROFILE)
        .then(function (ccuProfiles) {
          deferred.resolve(ccuProfiles);
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    return deferred.promise;
  };

  var getAllGroupedByCategory = function () {
    var deferred = $q.defer();
    var groupedList = {};
    storageService.all(storageService.CCU_PROFILE)
        .then(function (result) {
          for (var index in result) {tem
            var ccuProfile = result[index];
            var NOT_FOUND = -1;
            var existingGroups = Object.keys(groupedList);
            if (existingGroups.indexOf(ccuProfile.RefType) === NOT_FOUND) {
              groupedList[ccuProfile.RefType] = [];
            }
            groupedList[ccuProfile.RefType].push(ccuProfile);
          }
          deferred.resolve(groupedList);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    return deferred.promise;
  };

  return {
    getAllGroupedByCategory: getAllGroupedByCategory,
    getAll: getCcuProfiles,
    get: getByModelId
  };
});
