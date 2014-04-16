'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, syncService, appConfigService, $q, $rootScope) {
      //TODO: show animation to show that action is taking place. maybe a modal box
      var clearAndLoadFixture = function(){
        var deferred = $q.defer();
        storageService.clear().then(function(clearResult){
          console.log('clear storage caled');
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