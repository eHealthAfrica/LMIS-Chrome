'use strict';

angular.module('lmisChromeApp')
  .factory('userFactory', function ($q, $rootScope, storageService) {

    // Public API here
    return {

      /**
       * return complete JSON object of user attributes even nested attributes if exists.
       * @param id
       */
      get: function(id){
        var deferred = $q.defer();
        storageService.find(storageService.USER, id).then(function(data){
          deferred.resolve(data);
          if (!$rootScope.$$phase) $rootScope.$apply();
        });
        return deferred.promise;
      },
      getLoggedInUser: function () {
        //TODO: replace with logged in user id
        var loggedInUserId = "1";
        var deferred = $q.defer();
        var loggedInUser = {};
        storageService.find(storageService.USER, loggedInUserId).then(function(data){
          if(data !== undefined){
            deferred.resolve(data);
            return;
          }
          deferred.resolve(loggedInUser);
        });
        return deferred.promise;
      }
    };
  });
