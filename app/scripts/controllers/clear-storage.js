'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, syncService, cacheService, $q) {

      var clearAndLoadFixture = function(){
        var deferred = $q.defer();

        //clear cache
        cacheService.clearCache();

        //clear local storage
        storageService.clear().then(function(clearResult){

          var promises = [];
          promises.push(storageService.loadFixtures());

          $q.all(promises).then(function(results) {
            deferred.resolve(results);
            $state.go('appConfigWelcome', {storageClear: true});
          });

        });
        return deferred.promise;
      };

      clearAndLoadFixture();
    }
  })
});