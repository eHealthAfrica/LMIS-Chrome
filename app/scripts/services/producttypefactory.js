'use strict';

angular.module('lmisChromeApp')
  .factory('productTypeFactory', function ($q, storageService) {

    // Public API here
    return {
      /**
       * returns json object of product types each nested attribute is returned as a JSON,
       * e.g ProductType.UOM will be returned as a JSON of UOM. similar to ORM format.
       */
      getAll: function(){
        var deferred = $q.defer();
        var uomList = {};

        storageService.get(storageService.UOM).then(function(data){
          uomList = data;
        });

        storageService.all(storageService.PRODUCT_TYPES).then(function(data){
          var productTypes = [];
          for(var index in data){
            var productType  = data[index]
            //replace productType.base_uom(which is uuid) with base_uom json object
            productType.base_uom = uomList[productType.base_uom];
            productTypes.push(productType);
          }
          deferred.resolve(productTypes);
        });

        return deferred.promise;
      },

      get: function (uuid) {
         var productType = null;
        var uomList = {};
        storageService.get(storageService.UOM).then(function(data){
          uomList = data;
        });
        storageService.get(storageService.PRODUCT_TYPES).then(function(data){
          productType =  data[uuid];
          productType.base_uom = uomList[productType.base_uom];
        });
        return productType;
      }
    };
  });
