'use strict';

angular.module('lmisChromeApp')
    .factory('currencyFactory', function ($q, storageService) {
      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.CURRENCY, uuid).then(function (data) {
          deferred.resolve(data);
        });
        return deferred.promise;
      }

      // Public API here
      return {
        get: getByUUID
      };

    });

