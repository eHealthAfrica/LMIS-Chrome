'use strict';

angular.module('lmisChromeApp')
    .factory('storageUnitFactory', function ($q, $rootScope, storageUnitTypeFactory, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.CCU, uuid).then(function (data) {
          var storageUnit = data;
          if (!angular.equals(storageUnit, undefined)) {
            //TODO: attach JSON object of nested attributes.
            storageUnitTypeFactory.get(storageUnit.type).then(function (data) {
              storageUnit.type = data;
            });
          }
          deferred.resolve(storageUnit);
        });
        return deferred.promise;
      }

      // Public API here
      return {

        getFacilityStorageUnits: function (facilityUUID) {
           var deferred = $q.defer(), facilityStorageUnits = [];
            storageService.all(storageService.CCU).then(function(data){
              for (var index in data) {
                var storageUnit = data[index];
                if (!angular.equals(storageUnit, undefined)) {

                }
              }
            });

          storageService.get(storageService.CCU).then(function (data) {
            for (var key in data) {
              var storageUnit = data[key];
              if (storageUnit.facility === facilityUUID) {
                facilityStorageUnits.push(storageUnit);
              }
            }
          });
          return facilityStorageUnits;
        },

        getAll: function () {
          var deferred = $q.defer(), storageUnits = [];

          storageService.all(storageService.UOM).then(function (data) {
            angular.forEach(data, function (datum) {
              storageUnits.push(getByUUID(datum.uuid).then(function (storageUnit) {
                deferred.notify(datum);
                return storageUnit;
              }));
            });

            $q.all(storageUnits).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        get: getByUUID
      };

    });