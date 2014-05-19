'use strict';

angular.module('lmisChromeApp')
    .factory('modeOfAdministrationFactory', function ($q, storageService) {

      var getByUuid = function(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.MODE_OF_ADMINISTRATION, uuid)
            .then(function (data) {
              deferred.resolve(data);
            });
        return deferred.promise;
      };

      var getAll = function(){
        var deferred = $q.defer();
        var promises = [];
        storageService.all(storageService.MODE_OF_ADMINISTRATION)
            .then(function(result){
              for(var index in result){
                var moa = result[index];
                promises.push(getByUuid(moa.uuid));
              }

              //FIXME: extract all $q.all calls in the project to utility function
              $q.all(promises)
                  .then(function(result){
                    deferred.resolve(result);
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
