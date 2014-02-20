'use strict';

angular.module('lmisChromeApp')
  .factory('productsFactory', function ($q, storageService) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      getProductTypeByUUID: function (uuid) {
        console.log(uuid);
         var productType = null;
        storageService.get(storageService.PRODUCT_TYPES).then(function(data){
          productType =  data[uuid];
          console.log(productType);
        });
        return productType;
      }
    };
  });
