'use strict';

angular.module('lmisChromeApp')
  .factory('facilityFactory', function (storageService) {

    // Public API here
    return {
      getFacilityStorageUnits: function (facilityUUID) {
        var storageUnits = [];
        storageService.get(storageService.CCU).then(function(data){
          for(var key in data){
            var storageUnit = data[key];
            if(storageUnit.facility === facilityUUID){
              storageUnits.push(storageUnit);
            }
          }
        });
        return storageUnits;
      }

    };
  });
