'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, cacheService, $q, alertFactory, notificationService, i18n, memoryStorageService, fixtureLoaderService) {

      var clearAndLoadFixture = function () {
        var deferred = $q.defer();
        //clear storage, cache and memory store.
        cacheService.clearCache();
        memoryStorageService.clearAll();
        storageService.clear()
          .then(function () {
            //reload fixtures into memory store.
            fixtureLoaderService.loadFiles(storageService.FIXTURE_NAMES)
              .then(function () {
                $state.go('appConfigWelcome');
              })
              .catch(function(reason){
                console.error(reason);
              });
          })
          .catch(function (reason) {
            console.error(reason);
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
          } else {
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
