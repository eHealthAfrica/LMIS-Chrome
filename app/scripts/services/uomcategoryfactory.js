'use strict';

angular.module('lmisChromeApp')
    .factory('uomCategoryFactory', function ($q, storageService) {

      // Public API here
      return {

        get: function (uuid) {
          var deferred = $q.defer();
          storageService.get(storageService.UOM_CATEGORY).then(function (data) {
            var uomCategory = data[uuid];
            if (uomCategory !== undefined) {
              uomCategory.parent = data[uomCategory.parent];
            }
            deferred.resolve(uomCategory);
          });
          return deferred.promise;
        }
      };

    });
