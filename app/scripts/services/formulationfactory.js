'use strict';

angular.module('lmisChromeApp')
  .factory('formulationFactory', function ($q, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_FORMULATION, uuid).then(function(data){
          deferred.resolve(data);
        });
        return deferred.promise;
      }

    // Public API here
    return {

    getAll: function(){
        var deferred = $q.defer();
        storageService.get(storageService.PRODUCT_FORMULATION).then(function(data){
          var formulations = [];
          for(var uuid in data){
            getByUUID(uuid).then(function(data){
                if(data !== undefined){
                  formulations.push(data);
                }
            });
          }
          deferred.resolve(formulations);
        });
        return deferred.promise;
      },

      get: getByUUID
    };

  });
