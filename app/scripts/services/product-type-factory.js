'use strict';

angular.module('lmisChromeApp')
    .factory('productTypeFactory', function ($q, storageService, memoryStorageService, uomFactory, utility) {

      var getByUuid = function(key) {
        var uuid = utility.getStringUuid(key);
        var productType = memoryStorageService.get(storageService.PRODUCT_TYPES, uuid);
        //attach nested objects if it exists.
        if(typeof productType === 'object'){
          productType.base_uom = uomFactory.get(productType.base_uom);
        }else{
          console.error('product type accessed with key: '+uuid+', does not exist.');
        }
        return productType;
      };

      var getProductTypes = function(){
        var productTypes = [];
        var productTypeDB = memoryStorageService.getDatabase(storageService.PRODUCT_TYPES);
        for(var key in productTypeDB){
          var pType = getByUuid(key);
          if(typeof pType === 'object'){
            productTypes.push(pType);
          }
        }
        return productTypes;
      };

      return {
        getAll: getProductTypes,
        get: getByUuid
      };

    });
