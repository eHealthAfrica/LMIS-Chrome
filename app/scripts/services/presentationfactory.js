'use strict';

angular.module('lmisChromeApp')
    .factory('presentationFactory', function ($q, uomFactory, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_PRESENTATION, uuid).then(function (data) {
          var productPresentation = data;
          if (productPresentation !== undefined) {
            var promises = {
              uom: uomFactory.get(productPresentation.uom)
            };

            $q.all(promises).then(function(result) {
              for(var key in result) {
                productPresentation[key] = result[key];
              }
              deferred.resolve(productPresentation);
            })
            .catch(function(err){
              deferred.reject(err);
             });
          }else{
            deferred.resolve();
          }
        }, function(err){
          deferred.reject(err);
        });
        return deferred.promise;
      }

      // Public API here
      return {

        getAll: function () {
          var deferred = $q.defer();
          storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
            var presentations = [];
            for (var uuid in data) {
              getByUUID(uuid).then(function (data) {
                if (data !== undefined) {
                  presentations.push(data);
                }
              });
            }
            deferred.resolve(presentations);
          }, function(err){
            deferred.reject(err);
          });
          return deferred.promise;
        },

        get: getByUUID
      };

    });
