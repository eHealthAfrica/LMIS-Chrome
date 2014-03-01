'use strict';

angular.module('lmisChromeApp')
    .factory('facilityFactory', function ($q, $rootScope, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.FACILITY, uuid).then(function (data) {
          var facility = data;
          if (!angular.equals(facility, undefined)) {
            //TODO: add nested attributes such as facility type, location etc when their factories are ready
          }
          deferred.resolve(facility);
        });
        return deferred.promise;
      }

      // Public API here
      return {
        getAll: function () {
          var deferred = $q.defer(), facilities = [];

          storageService.all(storageService.FACILITY).then(function (data) {
                angular.forEach(data, function (datum) {
                  if (!angular.equals(datum, undefined)) {
                    facilities.push(getByUUID(datum.uuid).then(function (facility) {
                      deferred.notify(datum);
                      return facility;
                    }));
                  }
                });

                $q.all(facilities).then(function (results) {
                  deferred.resolve(results);
                  if (!$rootScope.$$phase) $rootScope.$apply();
                });
              }
          );
          return deferred.promise;
        },

        get: getByUUID
      };
    });
