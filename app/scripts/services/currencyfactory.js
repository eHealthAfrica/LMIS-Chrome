'use strict';

angular.module('lmisChromeApp')
  .factory('currencyFactory', function ($q, uomCategoryFactory, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.find(storageService.CURRENCY, uuid).then(function(data){
          deferred.resolve(data);
        });
        return deferred.promise;
      }

    // Public API here
    return {

      getFacilityInventory: function(){
        var deferred = $q.defer();
        storageService.get(storageService.UOM).then(function(data){
          var currencies = [];
          for(var uuid in data){
            var currency = data[uuid];
            currencies.push(currency);
          }
          deferred.resolve(currencies);
        });
        return deferred.promise;
      },

      get: getByUUID
    };

  });

