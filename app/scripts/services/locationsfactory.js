'use strict';

angular.module('lmisChromeApp')
  .factory('locationsFactory', function($q, storageService) {
    function getByUUID(uuid) {
      var deferred = $q.defer();
      storageService.find(storageService.LOCATIONS, uuid)
        .then(function(data) {
          deferred.resolve(data);
        });
      return deferred.promise;
    }

    // Public API here
    return {
      get: getByUUID
    };
  });
