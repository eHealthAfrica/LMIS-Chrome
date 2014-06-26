'use strict';

angular.module('lmisChromeApp')
    .factory('uomFactory', function ($q, storageService, utility, memoryStorageService) {

      var getByUuid = function(uuid) {
        var uuid = utility.getStringUuid(uuid);
        var uom = memoryStorageService.get(storageService.UOM, uuid);
        if(typeof uom !== 'object'){
          console.error('uom with uuid'+uuid+', does not exist. or is not and object but: '+uom);
        }
        return uom;
      };

      var getAllUom = function () {
        var uomDb = memoryStorageService.getDatabase(storageService.UOM);
        var uomList = [];
        for(var key in uomDb){
          var uom = getByUuid(key);
          uomList.push(uom);
        }
        return uomList;
      };

      // Public API here
      return {
        getAll: getAllUom,
        get: getByUuid
      };

    });
