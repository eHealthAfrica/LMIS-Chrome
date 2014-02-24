'use strict';

angular.module('lmisChromeApp')
  .factory('uomFactory', function ($q, uomCategoryFactory, storageService) {

      function getUOMbyUUID(uuid){
        var deferred = $q.defer();
        storageService.get(storageService.UOM).then(function(data){
          var uom = data[uuid];
          if(uom !== undefined){
            uomCategoryFactory.get(uom.uom_category).then(function(data){
              uom.uom_category  = data;
            });
          }
          deferred.resolve(uom);
        });
        return deferred.promise;
      }

    // Public API here
    return {

      getAll: function(){
        var deferred = $q.defer();
        storageService.get(storageService.UOM).then(function(data){
          var uomList = [];
          for(var uuid in data){
            var uom = null;
            getUOMbyUUID(uuid).then(function(data){
                uom = data;
                if(uom !== undefined){
                  uomList.push(uom);
                }
            });
          }
          deferred.resolve(uomList);
        });
        return deferred.promise;
      },

      get: getUOMbyUUID
    };

  });
