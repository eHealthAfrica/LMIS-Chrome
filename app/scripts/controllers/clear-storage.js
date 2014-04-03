'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function (storageService, $state) {
      storageService.clear().then(function (clearResult) {
        storageService.loadFixtures().then(function (loadFixtureResult) {
          $state.go('home.index.mainActivity', {storageClear: true});
        });
      });
    }
  })
});