'use strict';

angular.module('lmisChromeApp')
  .factory('facilityFactory', function (storageService) {

    // Public API here
    return {
      getFacilityStorageUnits: function (facilityUUID) {
        var storageUnits = [];
        storageService.get(storageService.CCU).then(function(data){
          for(var ccu in data){
            console.log(ccu);
          }
        });
      }
    };
  });
