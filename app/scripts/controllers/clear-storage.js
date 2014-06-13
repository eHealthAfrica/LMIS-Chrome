'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, $rootScope, syncService, cacheService, $q, alertFactory) {

      var clearAndLoadFixture = function(){
        var deferred = $q.defer();

        //clear cache
        cacheService.clearCache();

        //clear local storage
        storageService.clear()
            .then(function () {
              var promises = [];
              promises.push(storageService.loadFixtures());

              $q.all(promises).then(function (results) {
                deferred.resolve(results);
                alertFactory.success(i18n('clearStorageMsg'));
                $state.go('appConfigWelcome');
              });
            })
            .catch(function(reason){
              console.log(reason);
            });
        return deferred.promise;
      };
      clearAndLoadFixture();
    }
  });
});