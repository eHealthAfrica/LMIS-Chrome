'use strict';

angular.module('lmisChromeApp')
  .factory('productProfileFactory', function ($q, storageService, memoryStorageService, presentationFactory, productTypeFactory, productCategoryFactory, utility) {

    var getByUuid = function(uuid) {
      uuid = utility.getStringUuid(uuid);
      var prodProfile = memoryStorageService.get(storageService.PRODUCT_PROFILE, uuid);
      if(typeof prodProfile === 'object'){
        prodProfile.presentation = presentationFactory.get(prodProfile.presentation);
        prodProfile.product = productTypeFactory.get(prodProfile.product);
        prodProfile.category = productCategoryFactory.get(prodProfile.category);
      }else{
        console.error('productProfile with uuid: '+uuid+' is not an object.');
      }
      return prodProfile;
    };

    var getAll = function() {
      var prodProfileDb = memoryStorageService.getDatabase(storageService.PRODUCT_PROFILE);
      var productProfiles = [];
      for(var key in prodProfileDb){
        var prodProfile = getByUuid(key);
        if(typeof prodProfile === 'object'){
          productProfiles.push(prodProfile);
        }
      }
      return productProfiles;
    };

    /**
     * This function returns product profiles for a given product type
     *
     * @param productType
     * @returns {promise|promise|*|Function|promise}
     */
    var getByProductType = function(productType) {
      var ptUuid = utility.getStringUuid(productType);
      var productProfiles = getAll();
      return productProfiles.filter(function(p) { return utility.getStringUuid(p.product) === ptUuid; });
    };

    var getProductProfileBatch = function(batch){
      if (!Array.isArray(batch)) {
        throw 'expected argument to be an array. not array argument passed';
      }
      var productProfiles = [];
      for (var index in batch) {
        var obj = batch[index];
        var uuid = utility.getStringUuid(obj);
        var productProfile = getByUuid(uuid);
        if (typeof productProfile === 'object') {
          productProfiles.push(productProfile);
        }
      }
      return productProfiles;
    };

    var getAllGroupedByProductCategory = function(){
      var db = memoryStorageService.getDatabase(storageService.PRODUCT_PROFILE);
      var keys = Object.keys(db);
      return getBatchGroupedByProductCategory(keys);
    };

    var getBatchGroupedByProductCategory = function(productProfiles){
      var groupedList = {};
      var NOT_FOUND = -1;
      var existingGroups = [];
      for (var index in productProfiles) {

        //TODO: use utility getStringUUid to get uuid.
        var uuid = utility.getStringUuid(productProfiles[index]);
        var productProfile = getByUuid(uuid);

        //TODO: for debugging checks, remove later.
        if(typeof productProfile === 'undefined' || typeof productProfile === 'null'){
          console.error('product profile is undefined');
          continue;
        }

        //TODO: add check for null or undefined category
        if(typeof productProfile.category === 'undefined' || typeof productProfile.category === 'null'){
          console.error('category is : '+productProfile);
          continue;
        }

        //TODO: add check for null or undefined category
        if(typeof productProfile.category !== 'object' && ('uuid' in productProfile.category)){
          console.error('Product Category: '+productProfile.category+', does not have uuid or is not an object ');
          continue;
        }


        if (existingGroups.indexOf(productProfile.category.uuid) === NOT_FOUND) {
          var categoryObj = productProfile.category;
          var group = {
            category: categoryObj,
            productProfiles: []
          }
          existingGroups.push(productProfile.category.uuid);
          groupedList[productProfile.category.uuid] = group;
        }
        groupedList[productProfile.category.uuid].productProfiles.push(productProfile);
      }
      return groupedList;
    };

    return {
      get: getByUuid,
      getAll: getAll,
      getByProductType: getByProductType,
      getBatch: getProductProfileBatch,
      getAllGroupedByCategory: getAllGroupedByProductCategory,
      getBatchGroupedByCategory: getBatchGroupedByProductCategory
    };
  });
