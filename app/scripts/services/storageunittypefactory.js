'use strict';

angular.module('lmisChromeApp')
    .factory('storageUnitTypeFactory', function ($q, userFactory, $rootScope, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.CCU_TYPE, uuid).then(function (data) {
          if (data !== undefined) {
            userFactory.get(data.created_by).then(function(created_by){
              data.created_by = created_by;
            });

             userFactory.get(data.modified_by).then(function(modified_by){
              data.modified_by = modified_by;
            });

            storageService.find(storageService.CCU_TYPE, uuid).then(function(parent){
              data.parent = parent;
            });

          }
          deferred.resolve(data);
          if (!$rootScope.$$phase) $rootScope.$apply();
        });
        return deferred.promise;
      }

      // Public API here
      return {

        getFacilityInventory: function () {
          var deferred = $q.defer(), storageUnitTypes = [];

          storageService.all(storageService.CCU_TYPE).then(function (data) {
            angular.forEach(data, function (datum) {
              storageUnitTypes.push(getByUUID(datum.uuid).then(function (storageUnitType) {
                deferred.notify(datum);
                return storageUnitType;
              }));
            });

            $q.all(storageUnitTypes).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        get: getByUUID
      };

    });

