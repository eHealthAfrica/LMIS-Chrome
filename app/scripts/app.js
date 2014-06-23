'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config',
  'nvd3ChartDirectives',
  'angular-growl',
  'ngAnimate',
  'db'
])
  .run(function(storageService, $rootScope, $state, $window, appConfigService, fixtureLoaderService, growl) {

    $window.showSplashScreen = function() {
      $state.go('loadingFixture');
    };

    $window.hideSplashScreen = function() {
      appConfigService.getCurrentAppConfig()
        .then(function (cfg) {
          if (typeof cfg === 'object') {
            $state.go('home.index.home.mainActivity');

            //trigger background syncing on start up
            appConfigService.syncOfflineAnalytics().finally(function(){
                      console.log('offline reports send to ga server.');
                });
            appConfigService.updateAppConfigAndStartBackgroundSync()
              .finally(function () {
                console.log('updateAppConfigAndStartBackgroundSync triggered on start up have been completed!');
              });

          } else {
            $state.go('appConfigWelcome');
          }
        })
        .catch(function (reason) {
          console.error(reason);
        });
    };

    $rootScope.$on('LOADING_COMPLETED', $window.hideSplashScreen);
    $rootScope.$on('START_LOADING', $window.showSplashScreen);

    //TODO: show splash screen while loading fixture into cache
    fixtureLoaderService.loadFiles(storageService.FIXTURE_NAMES)
      .catch(function(reason){
        console.log(reason);
        growl.error('Fixture loading failed', {ttl: -1});
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
