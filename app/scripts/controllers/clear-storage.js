'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('clearStorage', {
        parent: 'root.index',
        url: '/clear-storage',
        controller: 'ClearStorage'
      });
  })
  .controller('ClearStorage', function($scope, storageService, $state, backgroundSyncService, cacheService, $q, alertFactory, notificationService, i18n, memoryStorageService, fixtureLoaderService, growl) {
    $scope.clearAndLoadFixture = function() {
      var deferred = $q.defer();
      backgroundSyncService.cancel();
      cacheService.clearCache();
      memoryStorageService.clearAll();
      storageService.clear()
        .then(function() {
          //reload fixtures into memory store.
          fixtureLoaderService.setupLocalAndMemoryStore(fixtureLoaderService.REMOTE_FIXTURES)
            .then(function() {
              $state.go('appConfigWelcome');
            })
            .catch(function(reason) {
              console.error(reason);
              growl.error(reason, {ttl: -1});
            });
        })
        .catch(function(reason) {
          growl.error(i18n('clearStorageFailed'), {ttl: -1});
          console.error(reason);
        });
      return deferred.promise;
    };

    var confirmationTitle = i18n('clearStorageTitle');
    var confirmationQuestion = i18n('clearStorageConfirmationMsg');
    var buttonLabels = [i18n('yes'), i18n('no')];
    notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
      .then(function(isConfirmed) {
        if (isConfirmed === true) {
          $scope.clearAndLoadFixture();
          $state.go('loadingFixture');
        } else {
          $state.go('home.index.home.mainActivity');
        }
      })
      .catch(function(reason) {
        console.error(reason);
        $state.go('home.index.home.mainActivity');
      });
  });
