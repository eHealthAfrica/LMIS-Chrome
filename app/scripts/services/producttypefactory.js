'use strict';

angular.module('lmisChromeApp')
    .factory('productTypeFactory', function ($q, storageService, uomFactory) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_TYPES, uuid).then(function (data) {
          var productType = null;
          if (data !== undefined) {
            productType = data;
            uomFactory.get(productType.base_uom).then(function (data) {
              productType.base_uom = data;
            });
          }
          deferred.resolve(productType);
        });
        return deferred.promise;
      }


      // Public API here
      return {
        /**
         * returns json object of product types each nested attribute is returned as a JSON,
         * e.g ProductType.UOM will be returned as a JSON of UOM. similar to ORM format.
         */
        getAll: function () {
          var deferred = $q.defer();
          storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
            var productTypes = [];
            for (var uuid in data) {
              var productType = null;
              getByUUID(uuid).then(function (data) {
                productType = data;
                if (productType !== undefined) {
                  productTypes.push(productType);
                }
              });
            }
            deferred.resolve(productTypes);
          });
          return deferred.promise;
        },

        get: getByUUID
      };
    });
