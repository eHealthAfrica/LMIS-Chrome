'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('clearStorage', {
    url: '/clear-storage',
    controller: function(storageService, $state){
      storageService.clear();
      $state.go('home.index.mainActivity', {storageClear: true});
      console.log('clear storage');
    }
  });
})