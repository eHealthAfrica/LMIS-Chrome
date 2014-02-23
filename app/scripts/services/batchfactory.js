'use strict';

angular.module('lmisChromeApp')
    .factory('batchFactory', function ($q, storageService) {

      /**
       * Expose Public API
       */
      return {
        getAll: function () {
          var deferred = $q.defer();
          var productTypes = {};
          var presentations = {};

          storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
            productTypes = data;
          });

          storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
            presentations = data;
          });

          storageService.get(storageService.COMPANY).then(function (data) {
            presentations = data;
          });

          storageService.all(storageService.PRODUCT_TYPES).then(function (data) {
            var batches = [];
            for (var index in data) {
              var batch = data[index]
              //replace nested attribute with their json object
              batch.product = productTypes[batch.product];
              batch.presentation = presentations[batch.presentation];

              batches.push(batch);
            }
            deferred.resolve(batches);
          });

          return deferred.promise;
        }
      };
    });
