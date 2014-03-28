'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function(storageService, $state){
      storageService.clear();
      storageService.loadFixtures();
      $state.go('home.index.mainActivity', {storageClear: true});
    }
  });
})