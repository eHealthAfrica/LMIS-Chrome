'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, syncService, appConfigService, $q) {
      //TODO: show animation to show that action is taking place. maybe a modal box
      var clearAndLoadFixture = function(){
        var deferred = $q.defer();
        storageService.clear().then(function(clearResult){
          var promises = [];
          promises.push(storageService.loadFixtures());

          $q.all(promises).then(function(results) {
            deferred.resolve(results);
          });

        });
        return deferred.promise;
      };

      clearAndLoadFixture().then(function(){
        $state.go('appConfigWelcome', {storageClear: true});
      });
    }
  })
});