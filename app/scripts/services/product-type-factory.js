'use strict';

angular.module('lmisChromeApp')
    .factory('productTypeFactory', function ($q, storageService, uomFactory, utility) {

      var getByUuid = function(uuid) {
        var deferred = $q.defer();
        uuid = utility.getStringUuid(uuid);
        storageService.find(storageService.PRODUCT_TYPES, uuid)
            .then(function (productType) {
              if (productType !== undefined) {
                var uom_uuid = utility.getStringUuid(productType.base_uom);
                var promises = {
                  base_uom: uomFactory.get(uom_uuid)
                };

                $q.all(promises)
                    .then(function(result){
                      for(var key in result) {
                        productType[key] = result[key];
                      }
                      deferred.resolve(productType);
                    })
                    .catch(function(reason){
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

      var getProductTypeList = function(){
        var deferred = $q.defer();

        storageService.all(storageService.PRODUCT_TYPES)
            .then(function (data) {
              var promises = [];
              for(var index in data){
                var productType = data[index];
                var uuid = utility.getStringUuid(productType);
                promises.push(getByUuid(uuid));
              }

              $q.all(promises)
                  .then(function(results){
                    deferred.resolve(results);
                  })
                  .catch(function(reason){
                    deferred.reject(reason);
                  });
            })
            .catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      return {
        getAll: getProductTypeList,
        get: getByUuid
      };

    });
