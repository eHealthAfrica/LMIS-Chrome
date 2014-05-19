'use strict';

angular.module('lmisChromeApp')
    .factory('presentationFactory', function ($q, uomFactory, storageService) {

      var getByUuid = function(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_PRESENTATION, uuid).then(function (data) {
          var productPresentation = data;
          if (productPresentation !== undefined) {
            var promises = {
              uom: uomFactory.get(productPresentation.uom)
            };

            $q.all(promises).then(function (result) {
              for (var key in result) {
                productPresentation[key] = result[key];
              }
              deferred.resolve(productPresentation);
            })
                .catch(function (err) {
                  deferred.reject(err);
                });
          } else {
            deferred.resolve();
          }
        }).catch(function (err) {
              deferred.reject(err);
            });
        return deferred.promise;
      };

      var getAllPresentation = function () {
        var deferred = $q.defer();
        storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
          var presentations = [];
          for (var uuid in data) {
            presentations.push(getByUuid(uuid));
          }

          $q.all(presentations)
              .then(function (results) {
                deferred.resolve(results);
              })
              .catch(function (reason) {
                deferred.reject(reason);
              });
        }).catch(function (err) {
              deferred.reject(err);
            });
        return deferred.promise;
      };

      return {
        getAll: getAllPresentation,
        get: getByUuid
      };

    });
