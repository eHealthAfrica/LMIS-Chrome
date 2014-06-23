'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config',
  'nvd3ChartDirectives',
  'angular-growl',
  'ngAnimate'
])
  // Load fixture data
  .run(function(storageService, $rootScope, $state, $window, appConfigService) {

    $window.showSplashScreen = function() {
      $state.go('loadingFixture');
    };

    $window.hideSplashScreen = function() {
      $state.go('home.index.home.mainActivity');
    };

    $rootScope.$on('LOADING_COMPLETED', $window.hideSplashScreen);
    $rootScope.$on('START_LOADING', $window.showSplashScreen);

    //load fixtures if not loaded yet.
    storageService.loadFixtures().then(function() {
      //update appConfig from remote then trigger background syncing
      appConfigService.getCurrentAppConfig().then(function(cfg) {
        if (typeof cfg !== 'undefined') {
            appConfigService.syncOfflineAnalytics().finally(function(){
                      console.log('offline reports send to ga server.');
                });
          appConfigService.updateAppConfigAndStartBackgroundSync()
            .finally(function() {
              console.log('updateAppConfigAndStartBackgroundSync triggered on start up have been completed!');
            });
        }
      });
      storageService.getAll().then(function(data) {
        console.log('finished loading: ' + (Object.keys(data)).join('\n'));
      });
    });
  })

  .config(function($compileProvider) {
    // to bypass Chrome app CSP for images.
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
  })

  .config(function(growlProvider) {
    growlProvider.globalTimeToLive({
      success: 2000,
      error: 5000,
      warning: 2000,
      info: 2000
    });
  });
