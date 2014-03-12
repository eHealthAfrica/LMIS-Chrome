'use strict';

angular.module('lmisChromeApp')
    .factory('batchFactory', function ($q, $rootScope, storageService, productTypeFactory, presentationFactory, companyFactory, currencyFactory, modeOfAdministrationFactory, formulationFactory, uomFactory) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.BATCH, uuid).then(function (data) {
          var batch = data;
          if (batch !== undefined) {
            //TODO: replace nested attribute with their json object
            productTypeFactory.get(batch.product).then(function (data) {
              batch.product = data;
            });
            presentationFactory.get(batch.presentation).then(function (data) {
              batch.presentation = data;
            });
            companyFactory.get(batch.manufacturer).then(function (data) {
              batch.manufacturer = data;
            });
            currencyFactory.get(batch.price_currency).then(function (data) {
              batch.price_currency = data;
            });
            modeOfAdministrationFactory.get(batch.mode_of_use).then(function (data) {
              batch.mode_of_use = data;
            });
            formulationFactory.get(batch.formulation).then(function (data) {
              batch.formulation = data;
            });
            uomFactory.get(batch.volume_uom).then(function (data) {
              batch.volume_uom = data;
            });
            deferred.resolve(batch);
          } else {
            deferred.reject('batch with given uuid not found.');
          }
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
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

        storageService.all(storageService.BATCH).then(function (data) {

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


      /**
       * Expose Public API
       */
      return {
        getAll: function () {
          var deferred = $q.defer(), batches = [];
          storageService.all(storageService.BATCH).then(function (data) {
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

        getByBatchNo: function (batchNo) {
          var deferred = $q.defer(), batch = [];
          storageService.all(storageService.BATCH).then(function (data) {
            angular.forEach(data, function (datum) {
              if (angular.equals(datum, undefined) || !angular.equals(datum.batch_no, batchNo)) {
                return;
              }
              getByUUID(datum.uuid).then(function (result) {
                deferred.notify(datum);
                batch = result;
                deferred.resolve(batch);
              });
            });
          });
          return deferred.promise;
        }

      };
    });
