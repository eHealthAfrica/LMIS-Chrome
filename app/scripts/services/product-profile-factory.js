'use strict';

angular.module('lmisChromeApp')
  .factory('productProfileFactory', function ($q, storageService) {

    var get = function(uuid) {
      var deferred = $q.defer();
      storageService.find(storageService.PRODUCT_PROFILE, uuid)
        .then(function(productProfile) {
          deferred.resolve(productProfile);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getAll = function() {
      var deferred = $q.defer();
      storageService.all(storageService.PRODUCT_PROFILE)
        .then(function(productProfiles) {
          deferred.resolve(result);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    return {
      load: getSettingsFromStorage,
      save: saveSettings
    };
  });
