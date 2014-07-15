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
  .run(function(storageService, $rootScope, $state, $window, appConfigService, backgroundSyncService, fixtureLoaderService, growl, utility, pouchMigrationService, $log, i18n) {

    function navigateToHome() {
      $state.go('home.index.home.mainActivity');
      backgroundSyncService.startBackgroundSync()
        .finally(function() {
          console.log('updateAppConfigAndStartBackgroundSync triggered on start up has been completed!');
        });
    }

    $window.showSplashScreen = function() {
      $state.go('loadingFixture');
    };

    $window.hideSplashScreen = function() {
      appConfigService.getCurrentAppConfig()
        .then(function(cfg) {
          if (angular.isObject(cfg) && !angular.isArray(cfg)) {
            $state.go('home.index.home.mainActivity');
          } else {
            $state.go('appConfigWelcome');
          }
        })
        .catch(function(reason) {
          growl.error('loading of App. Config. failed, please contact support.');
          console.error(reason);
        });
    };

    $rootScope.$on('LOADING_COMPLETED', $window.hideSplashScreen);
    $rootScope.$on('START_LOADING', $window.showSplashScreen);

    // TODO: see item:680
    if (!utility.has($window, 'PouchDB')) {
      // Short-circuit as PouchDB has not been sourced. Likely running in test
      // environment.
      return;
    }

    function loadAppConfig() {
      //TODO: figure out a better way of knowing if the app has been configured or not.
      storageService.all(storageService.APP_CONFIG)
      .then(function(res) {
        if (res.length > 0) {
          fixtureLoaderService.loadLocalDatabasesIntoMemory(fixtureLoaderService.REMOTE_FIXTURES)
            .then(function() {
              navigateToHome();
            })
            .catch(function(reason) {
              console.error(reason);
              growl.error('loading storage into memory failed, contact support.', {ttl: -1});
            });
        } else {
          //fresh install, download remote dbs
          fixtureLoaderService.setupLocalAndMemoryStore(fixtureLoaderService.REMOTE_FIXTURES)
            .catch(function(reason) {
              console.error(reason);
              growl.error('Local databases and memory storage setup failed, contact support.', {ttl: -1});
            });
        }
      })
      .catch(function(error) {
        growl.error('loading of App. Config. failed, please contact support.', {ttl: -1});
        console.error(error);
      });
    }

    function migrationErrorHandler(err) {
      var msg = i18n('migrationFailed');
      growl.error(msg);
      $log.error(err);
    }

    pouchMigrationService.migrate()
      .then(loadAppConfig)
      .catch(migrationErrorHandler);

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
