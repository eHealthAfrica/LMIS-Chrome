'use strict';

angular.module('lmisChromeApp')
    .factory('companyCategoryFactory', function ($q, $rootScope, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.COMPANY_CATEGORY, uuid).then(function (data) {
          var companyCategory = data;
          if (companyCategory !== undefined) {
            companyCategory.parent = data[uuid];
            storageService.get(storageService.USER).then(function (data) {
              companyCategory.created_by = data[companyCategory.created_by];
              companyCategory.modified_by = data[companyCategory.modified_by];
            });
          }
          deferred.resolve(companyCategory);
          if (!$rootScope.$$phase) $rootScope.$apply();
        });
        return deferred.promise;
      }

      // Public API here
      return {

        getFacilityInventory: function () {
          var deferred = $q.defer(), categories = [];

          storageService.all(storageService.COMPANY_CATEGORY).then(function (data) {
            angular.forEach(data, function (datum) {
              categories.push(getByUUID(datum.uuid).then(function (category) {
                deferred.notify(datum);
                return category;
              }));
            });

            $q.all(categories).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        get: getByUUID
      };

    });
