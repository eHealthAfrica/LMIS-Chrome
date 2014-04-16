'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, syncService, appConfigService, $q, $rootScope) {
      //TODO: show animation to show that action is taking place. maybe a modal box
      $rootScope.$emit('START_LOADING', {started: true});
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

      clearAndLoadFixture().then(function(result){
        $state.go('appConfigWelcome', {storageClear: true});
      });
    }
  })
});