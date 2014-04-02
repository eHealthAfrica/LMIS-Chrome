'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
    .state('clearStorage', {
      url: '/clear-storage',
      controller: function(storageService, $state){
        storageService.clear();
        $state.go('reloadPage');
      }
    })
    .state('reloadPage', {
      controller: function(storageService, $state){
        storageService.loadFixtures();
        $state.go('home.index.mainActivity', {storageClear: true});
      }
    });
});