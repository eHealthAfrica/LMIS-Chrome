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

  return {
    getAll: getCcuProfiles,
    get: getByModelId
  };
});
