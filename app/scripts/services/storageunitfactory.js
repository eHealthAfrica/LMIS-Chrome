'use strict';

angular.module('lmisChromeApp')
    .factory('storageUnitFactory', function ($q, $rootScope, facilityFactory, uomFactory, storageUnitTypeFactory, storageService) {

      var STORAGE_UNIT_STATUS = {
        NEEDS_REVIEW: 0,
        NOT_WORKING: 1,
        IN_REPAIR: 2,
        WORKING: 3
      };

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.CCU, uuid).then(function (data) {
          var storageUnit = data;
          if (!angular.equals(storageUnit, undefined)) {
            //TODO: attach JSON object of other nested attributes.
            storageUnitTypeFactory.get(storageUnit.type).then(function (data) {
              storageUnit.type = data;
            });

            facilityFactory.get(storageUnit.facility).then(function (facility) {
              storageUnit.facility = facility;
            });

            uomFactory.get(storageUnit.temperature_uom).then(function (uom) {
              storageUnit.temperature_uom = uom;
            });

            uomFactory.get(storageUnit.capacity_uom).then(function (uom) {
              storageUnit.capacity_uom = uom;
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
          storageService.all(storageService.CCU).then(function (data) {
            angular.forEach(data, function (datum) {
              if (!angular.equals(datum, undefined) && angular.equals(datum.facility, facilityUUID)) {
                facilityStorageUnits.push(getByUUID(datum.uuid).then(function (storageUnit) {
                  deferred.notify(datum);
                  return storageUnit;
                }));
              }
            });

            $q.all(facilityStorageUnits).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        getFacilityInventory: function () {
          var deferred = $q.defer(), storageUnits = [];

          storageService.all(storageService.CCU).then(function (data) {
            angular.forEach(data, function (datum) {
              if (!angular.equals(datum, undefined)) {
                storageUnits.push(getByUUID(datum.uuid).then(function (storageUnit) {
                  deferred.notify(datum);
                  return storageUnit;
                }));
              }
            });

            $q.all(storageUnits).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        get: getByUUID,

        STATUS: STORAGE_UNIT_STATUS

      };

    });