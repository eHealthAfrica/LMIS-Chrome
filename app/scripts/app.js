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
    'db',
    'LocalForageModule'
  ])
  .run(function(storageService, facilityFactory, locationService, $rootScope, $state, $window, appConfigService, backgroundSyncService, fixtureLoaderService, growl, utility, pouchMigrationService, $log, i18n, analyticsSyncService) {

    // TODO: see item:680
    if (!utility.has($window, 'PouchDB')) {
      // Short-circuit as PouchDB has not been sourced. Likely running in test
      // environment.
      return;
    }
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

  })
  .config(function($compileProvider) {
    // to bypass Chrome app CSP for images.
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
  })
  .config(function(growlProvider) {
    growlProvider.globalTimeToLive({
      success: 5000,
      error: 5000,
      warning: 5000,
      info: 5000
    });
  });
