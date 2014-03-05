'use strict';

angular.module('lmisChromeApp')
  .factory('uomFactory', function ($q, $rootScope, uomCategoryFactory, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.find(storageService.UOM, uuid).then(function(data){
          var uom = data;
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

      getFacilityInventory: function(){
        var deferred = $q.defer(), uomList = [];

        storageService.all(storageService.UOM).then(function (data) {
          angular.forEach(data, function (datum) {
            uomList.push(getByUUID(datum.uuid).then(function (uom) {
              deferred.notify(datum);
              return uom;
            }));
          });

          $q.all(uomList).then(function (results) {
            deferred.resolve(results);
            if (!$rootScope.$$phase) $rootScope.$apply();
          });
        });
        return deferred.promise;
      },

      get: getByUUID
    };

  });
