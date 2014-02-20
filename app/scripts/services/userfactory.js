'use strict';

angular.module('lmisChromeApp')
  .factory('userFactory', function ($q, storageService) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
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
