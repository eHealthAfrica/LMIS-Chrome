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
          deferred.resolve(productProfiles);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    /**
     * This function returns product profiles for a given product type
     *
     * @param productType
     * @returns {promise|promise|*|Function|promise}
     */
    var getByProductType = function(productType) {
      var deferred = $q.defer();
      var ptUuid = typeof productType === 'string' ? productType : productType.uuid;
      getAll().then(function(profiles){
        profiles = profiles.filter(function(p) { return p.product === ptUuid });
        deferred.resolve(profiles);
      }, function(err) {
        deferred.reject(err);
      });
       return deferred.promise;
    };

    var getProductProfileBatch = function(uuidList){
      if(!Array.isArray(uuidList)){
        throw 'expected argument to be an array., not array argument passed';
      }
      var deferred = $q.defer();
      storageService.all(storageService.PRODUCT_PROFILE)
          .then(function (productProfiles) {
            var result = productProfiles.filter(function (productProfile) {
              var NOT_FOUND = -1; //-1 value returned by indexOf if not found.
              return uuidList.indexOf(productProfile.uuid) > NOT_FOUND;
            });
            deferred.resolve(result);
          })
          .catch(function (reason) {
            deferred.reject(reason);
          });
      return deferred.promise;
    }

    return {
      get: get,
      getAll: getAll,
      getByProductType: getByProductType,
      getBatch: getProductProfileBatch
    };
  });
