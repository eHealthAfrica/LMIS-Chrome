'use strict';

angular.module('lmisChromeApp')
  .factory('productTypeFactory', function ($q, storageService, uomFactory) {

    var getByUuid = function (uuid) {
      var deferred = $q.defer();
      storageService.find(storageService.PRODUCT_TYPES, uuid)
        .then(function (productType) {
          if (productType !== undefined) {
            var promises = {
              base_uom: uomFactory.get(productType.base_uom)
            };

            $q.all(promises)
              .then(function (result) {
                for (var key in result) {
                  productType[key] = result[key];
                }
                deferred.resolve(productType);
              })
              .catch(function (reason) {
                deferred.reject(reason);
              });
          } else {
            deferred.resolve(productType);
          }
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getProductTypeList = function () {
      var deferred = $q.defer();

      storageService.all(storageService.PRODUCT_TYPES)
        .then(function (data) {
          var promises = [];
          for (var index in data) {
            var productType = data[index];
            promises.push(getByUuid(productType.uuid));
          }

          $q.all(promises)
            .then(function (results) {
              deferred.resolve(results);
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getProductTypesByBatch = function (lowStockUuidList) {
      var deferred = $q.defer();
      storageService.all(storageService.PRODUCT_TYPES)
        .then(function(result){
          var productTypesBatch = result.filter(function(elem){
            return lowStockUuidList.indexOf(elem.uuid) !== -1;
          });
          deferred.resolve(productTypesBatch);
        })
        .catch(function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    };

    return {
      getBatch: getProductTypesByBatch,
      getAll: getProductTypeList,
      get: getByUuid
    };

  });
