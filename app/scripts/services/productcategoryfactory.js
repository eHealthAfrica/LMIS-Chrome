'use strict';

angular.module('lmisChromeApp')
    .factory('productCategoryFactory', function ($q, storageService) {

      // Public API here
      return {
        /**
         * returns json object of product category each nested attribute is returned as a JSON,
         *
         */
        getAll: function () {
          var deferred = $q.defer();
          var users = {};
          storageService.get(storageService.USER).then(function (data) {
            users = data;
          });

          storageService.get(storageService.PRODUCT_CATEGORY).then(function (data) {
            var productCategories = [];
            for (var key in data) {
              var productCategory = data[key];
              if (productCategory !== undefined) {
                //replaced nested attributes with their complete JSON object
                productCategory.created_by = users[productCategory.created_by];
                productCategory.modified_by = users[productCategory.modified_by];
                productCategory.parent = data[productCategory.parent];
                productCategories.push(productCategory);
              }
            }
            deferred.resolve(productCategories);
          });
          return deferred.promise;
        },

        /**
         *
         * @param uuid - uuid of product category.
         * @returns {*} complete json object of nested attributes, returns only one level of nested parent attribute.
         */
        get: function (uuid) {
          var deferred = $q.defer();
          var users = {};
          storageService.get(storageService.USER).then(function (data) {
            users = data;
          });
          storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
            var productCategory = data[uuid];
            if (productCategory !== undefined) {
              productCategory.created_by = users[productCategory.created_by];
              productCategory.modified_by = users[productCategory.modified_by];
              productCategory.parent = data[productCategory.parent];
            }
            deferred.resolve(productCategory);
          });
          return deferred.promise;
        }
      };
    });
