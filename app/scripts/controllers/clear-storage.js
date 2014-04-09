'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state, syncService, appConfigService) {
      storageService.clear().then(function (clearResult) {
        syncService.clearPouchDB(appConfigService.APP_CONFIG);
        storageService.loadFixtures().then(function (loadFixtureResult) {
          $state.go('appConfigWelcome', {storageClear: true});
        });
      });
    }
  })
});