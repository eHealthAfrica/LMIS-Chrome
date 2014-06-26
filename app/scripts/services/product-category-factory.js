'use strict';

angular.module('lmisChromeApp')
    .factory('productCategoryFactory', function ($q, storageService, memoryStorageService, utility) {

      var getByUuid = function(uuid){
        var uuid = utility.getStringUuid(uuid);
        var categories = memoryStorageService.getDatabase(storageService.PRODUCT_CATEGORY);
        var prodCategory = categories[uuid];
        if(typeof prodCategory === 'object'){
          prodCategory.parent = categories[prodCategory.parent];
        }else{
          console.error('product category is not an object: '+prodCategory);
        }
        return prodCategory;
      };


      var getProductCategories = function(){
        var productCategories = [];
        var categories = memoryStorageService.getDatabase(storageService.PRODUCT_CATEGORY);
        for(var key in categories){
          var prodCategory = getByUuid(key);
          if(typeof prodCategory === 'object'){
            productCategories.push(prodCategory);
          }else{
            console.log('product category is not an object: '+prodCategory);
          }
        }
        return productCategories;
      };

      var getAllKeyValuePairs = function(){
        var keyValue = {};
        var categories = getProductCategories();
        for(var index in getProductCategories()){
          var prodCategory = categories[index];

          if(typeof prodCategory !== 'object'){
            throw 'product category does not exist.'
          }

          if(!('uuid' in prodCategory)){
            throw 'product category does not have uuid.'
          }

          keyValue[prodCategory.uuid] = prodCategory;
        }
        return keyValue;
      };

    return {
      getAll: getProductCategories,
      get: getByUuid,
      getKeyValuePairs: getAllKeyValuePairs
    };

  });
