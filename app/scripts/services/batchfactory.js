'use strict';

angular.module('lmisChromeApp')
    .factory('batchFactory', function ($q, $rootScope, storageService, productTypeFactory, presentationFactory, companyFactory, currencyFactory, modeOfAdministrationFactory, formulationFactory, uomFactory) {

      function getByUUID(uuid) {
        var deferred = $q.defer();

        storageService.find(storageService.BATCHES, uuid).then(function(batch) {
          var promises = {
            product: productTypeFactory.get(batch.product),
            presentation: presentationFactory.get(batch.presentation),
            manufacturer: companyFactory.get(batch.manufacturer),
            price_currency: currencyFactory.get(batch.price_currency),
            mode_of_use: modeOfAdministrationFactory.get(batch.mode_of_use),
            formulation: formulationFactory.get(batch.formulation),
            volume_uom: uomFactory.get(batch.volume_uom)
          };

          $q.all(promises).then(function(result) {
            for(var key in result) {
              batch[key] = result[key];
            }
            deferred.resolve(batch);
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          });
        });

        return deferred.promise;
      }

      /**
       *This functions receives product type uuid and returns all batches that belongs to the given product type.
       *
       * @param productTypeUUID - uuid of product type you want to return batches that are of the product type.
       */
      function getBatchesByProductType(productTypeUUID) {
        var deferred = $q.defer(), productTypeBatches = [];

        storageService.all(storageService.BATCHES).then(function (data) {

          angular.forEach(data, function (datum) {
            if (angular.equals(datum.product, productTypeUUID)) {
              productTypeBatches.push(getByUUID(datum.uuid).then(function (batch) {
                deferred.notify(datum);
                return batch;
              }));
            }
          });

          $q.all(productTypeBatches).then(function (results) {
            deferred.resolve(results);
            if (!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          });
        });
        return deferred.promise;
      }

      var getByBatchNo = function(batchNo) {
        var deferred = $q.defer();

        var resolveBatch = function(batch) {
          getByUUID(batch.uuid).then(function(batch) {
            deferred.resolve(batch);
          });
        };

        storageService.all(storageService.BATCHES).then(function(datum) {
          for(var i = datum.length - 1; i >= 0; i--) {
            if(angular.equals(datum[i].batch_no, batchNo)) {
              resolveBatch(datum[i]);
            }
          }
        });

        return deferred.promise;
      };


      /**
       * Expose Public API
       */
      return {
        getAll: function () {
          var deferred = $q.defer(), batches = [];
          storageService.all(storageService.BATCHES).then(function (data) {
            angular.forEach(data, function (datum) {
              if (!angular.equals(datum, undefined)) {
                batches.push(getByUUID(datum.uuid).then(function (batch) {
                  deferred.notify(datum);
                  return batch;
                }));
              }
            });

            $q.all(batches).then(function (results) {
              deferred.resolve(results);
            });
          });
          return deferred.promise;
        },

        get: getByUUID,
        getByProductType: getBatchesByProductType,
        getByBatchNo: getByBatchNo
      };
    });
