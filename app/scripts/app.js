'use strict';

angular.module('lmisChromeApp', [
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'toggle-switch',
  'pouchdb',
  'config'
])
  // Disable ui-router auto scrolling
  .config(function($uiViewScrollProvider, $anchorScrollProvider) {
    $uiViewScrollProvider.useAnchorScroll();
    $anchorScrollProvider.disableAutoScrolling();
  })

  // Load fixture data
  .run(function(storageService,  $rootScope, appConfigService, $state) {
    storageService.loadFixtures();
      $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
        appConfigService.load().then(function(appConfig){
          if(appConfig === undefined){
            if(from.name !== 'appConfigWelcome'){
              //have not visited the welcome page, take to welcome page
              $state.go('appConfigWelcome');
            }
          }
        });
      });
  });
