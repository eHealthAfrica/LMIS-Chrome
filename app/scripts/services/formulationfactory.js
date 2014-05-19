'use strict';

angular.module('lmisChromeApp').factory('formulationFactory', function ($q, storageService) {

  var getByUuid = function(uuid) {
    return storageService.find(storageService.PRODUCT_FORMULATION, uuid);
  };

  var getAll = function(){
    var deferred = $q.defer();
    var promises = [];
    storageService.all(storageService.PRODUCT_FORMULATION)
        .then(function(result){
          for(var index in result){
            var formulation = result[index];
            promises.push(getByUuid(formulation.uuid));
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
    getAll: getAll,
    get: getByUuid
  };

});
