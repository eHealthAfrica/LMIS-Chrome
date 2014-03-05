'use strict';

angular.module('lmisChromeApp')
    .factory('uomCategoryFactory', function ($q, $rootScope, storageService) {

      /**
       * This function returns complete attribute of any uom category object.
       *
       * @param uuid
       * @returns {uomCategory} - JSON Object
       */
      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.UOM_CATEGORY, uuid).then(function (data) {
          var uomCategory = data;
          if (uomCategory !== undefined) {
            storageService.find(storageService.UOM_CATEGORY, uomCategory.parent).then(function (data) {
              uomCategory.parent = data;
            });
          }
          deferred.resolve(uomCategory);
        });
        return deferred.promise;
      }

      function getAllUOMCategory() {
        var deferred = $q.defer(), uomCategories = [];

        storageService.all(storageService.UOM_CATEGORY).then(function (data) {
          angular.forEach(data, function (datum) {
            uomCategories.push(getByUUID(datum.uuid).then(function (uomCategory) {
              deferred.notify(datum);
              return uomCategory;
            }));
          });

          $q.all(uomCategories).then(function (results) {
            deferred.resolve(results);
            if (!$rootScope.$$phase) $rootScope.$apply();
          });
        });
        return deferred.promise;
      }

      // Public API here
      return {
        get: getByUUID,

        getFacilityInventory: getAllUOMCategory
      };

    });
