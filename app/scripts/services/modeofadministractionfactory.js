'use strict';

angular.module('lmisChromeApp')
  .factory('modeOfAdministrationFactory', function ($q, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.find(storageService.MODE_OF_ADMINISTRATION, uuid).then(function(data){
          deferred.resolve(data);
        });
        return deferred.promise;
      }

    // Public API here
    return {

    getAll: function(){
        var deferred = $q.defer();
        storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function(data){
          var modes = [];
          for(var uuid in data){
            getByUUID(uuid).then(function(data){
                if(data !== undefined){
                  modes.push(data);
                }
            });
          }
          deferred.resolve(modes);
        });
        return deferred.promise;
      },

      get: getByUUID
    };

  });
