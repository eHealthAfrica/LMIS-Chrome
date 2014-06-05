'use strict';

angular.module('lmisChromeApp')
    .factory('productCategoryFactory', function ($q, storageService) {

      var getByUuid = function(){
        var deferred = $q.defer();
        storageService.get(storageService.PRODUCT_CATEGORY)
            .then(function (productCategories) {
              var productCategory = productCategories[uuid];
              if (typeof productCategory !== 'undefined') {
                productCategory.parent = productCategories[productCategory.parent];
              }
              deferred.resolve(productCategory);
            })
            .catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };


      var getProductCategories = function(){
        var deferred = $q.defer();
        var productCategoryList = [];
        storageService.get(storageService.PRODUCT_CATEGORY)
            .then(function (productCategories) {
              for (var uuid in productCategories) {
                var productCategory = productCategories[uuid];
                if (typeof productCategory !== 'undefined') {
                  productCategory.parent = productCategories[productCategory.parent];
                  productCategoryList.push(productCategory);
                }
              }
              deferred.resolve(productCategoryList);
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      var getAllKeyValuePairs = function(){
        return storageService.get(storageService.PRODUCT_CATEGORY);
      };

      return {
        getAll: getProductCategories,
        get: getByUuid,
        getKeyValuePairs: getAllKeyValuePairs
      };

    });
