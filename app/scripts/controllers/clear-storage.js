'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, $rootScope, syncService, cacheService, $q, alertFactory,
                          notificationService, i18n) {

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
                $state.go('appConfigWelcome');
              });
            })
            .catch(function(reason){
              console.log(reason);
            });
        return deferred.promise;
      };
      var confirmationTitle = i18n('clearStorageTitle');
      var confirmationQuestion = i18n('clearStorageConfirmationMsg');
      var buttonLabels = [i18n('yes'), i18n('no')];
      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function (isConfirmed) {
          if (isConfirmed === true) {
            clearAndLoadFixture();
          }
          else{
            $state.go('home.index.home.mainActivity');
          }
        })
        .catch(function (reason) {
          console.error(reason);
          $state.go('home.index.home.mainActivity');
        });
    }
  });
});