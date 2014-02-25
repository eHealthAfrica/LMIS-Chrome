'use strict';

angular.module('lmisChromeApp')
    .factory('companyFactory', function ($q, $rootScope, companyCategoryFactory, storageService) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.COMPANY, uuid).then(function (data) {
          if (data !== undefined) {
            //TODO: add other nested attributes e.g company_category, address, contact(Jideobi)
            
          }
          deferred.resolve(data);
          if (!$rootScope.$$phase) $rootScope.$apply();
        });
        return deferred.promise;
      }

      // Public API here
      return {

        getAll: function () {
          var deferred = $q.defer(), companies = [];

          storageService.all(storageService.COMPANY).then(function (data) {
            angular.forEach(data, function (datum) {
              companies.push(getByUUID(datum.uuid).then(function (company) {
                deferred.notify(datum);
                return company;
              }));
            });

            $q.all(companies).then(function (results) {
              deferred.resolve(results);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          });
          return deferred.promise;
        },

        get: getByUUID
      };

    });

