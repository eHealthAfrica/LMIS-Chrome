'use strict';

angular.module('lmisChromeApp')
  .factory('facilityFactory', function(storageService) {

    var getByUUID = function(uuid) {
      return storageService.find(storageService.FACILITY, uuid);
    };

    var getAllFacilities = function() {
      return storageService.all(storageService.FACILITY);
    };

    var saveBatch = function(facilities) {
      return storageService.setDatabase(storageService.FACILITY, facilities);
    };

    var getFacilities = function(facilityIds) {
      return getAllFacilities()
        .then(function(hfs) {
          return hfs.filter(function(hf) {
            return facilityIds.indexOf(hf.uuid) !== -1;
          });
        });
    };

    return {
      getAll: getAllFacilities,
      get: getByUUID,
      saveBatch: saveBatch,
      getFacilities: getFacilities
    };

  });
