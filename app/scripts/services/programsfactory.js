'use strict';

angular.module('lmisChromeApp')
    .factory('programsFactory', function ($q, $rootScope, storageService) {

      /**
       * This returns complete attribute of a program even nested attributes
       *
       * @param uuid
       * @returns {program} - JSON Object
       */
        //TODO: replace nested attributes such as partners, parent with their complete JSON object(Jideobi)
      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.PROGRAM, uuid).then(function (data) {
          var program = data;
          deferred.resolve(program);
        });
        return deferred.promise;
      }

      function getAllProgram() {
        var deferred = $q.defer(), programs = [];

        storageService.all(storageService.PROGRAM).then(function (data) {
          angular.forEach(data, function (datum) {
            programs.push(getByUUID(datum.uuid).then(function (program) {
              deferred.notify(datum);
              return program;
            }));
          });

          $q.all(programs).then(function (results) {
            deferred.resolve(results);
            if (!$rootScope.$$phase) $rootScope.$apply();
          });
        });
        return deferred.promise;
      }

      // Public API here
      return {
        get: getByUUID,

        getAll: getAllProgram
      };
    });
