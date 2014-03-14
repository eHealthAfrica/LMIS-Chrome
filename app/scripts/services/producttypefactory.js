'use strict';

angular.module('lmisChromeApp')
    .factory('productTypeFactory', function ($rootScope, $q, storageService, uomFactory) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_TYPES, uuid).then(function (uom) {
          if (uom !== undefined) {
            uomFactory.get(uom.base_uom).then(function (data) {
              uom.base_uom = data;
            });
          }
          deferred.resolve(uom);
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
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
          var deferred = $q.defer(), productTypes = [];

          storageService.all(storageService.PRODUCT_TYPES).then(function (data) {
            angular.forEach(data, function (datum) {
              productTypes.push(getByUUID(datum.uuid).then(function (productType) {
                deferred.notify(datum);
                return productType;
              }));
            });

            $q.all(productTypes).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });
          });
          return deferred.promise;
        },

        get: getByUUID
      };
    });
