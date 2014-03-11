'use strict';

angular.module('lmisChromeApp', [
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'restangular',
  'ui.bootstrap',
  'ngTable',
  'ui.router',
  'tv.breadcrumbs',
  'pascalprecht.translate',
  'toggle-switch',
  'nvd3ChartDirectives'
])
  .config(function(RestangularProvider, $compileProvider) {
    RestangularProvider.setBaseUrl('http://lmis.ehealth.org.ng/api/v1');
    $compileProvider.aHrefSanitizationWhitelist(
      /^\s*(https?|ftp|mailto|chrome-extension):/
    );
  })

  // Disable ui-router auto scrolling
  .config(function($uiViewScrollProvider, $anchorScrollProvider) {
    $uiViewScrollProvider.useAnchorScroll();
    $anchorScrollProvider.disableAutoScrolling();
  })

  .config(function($translateProvider) {
    $translateProvider
      .preferredLanguage('en_GB')
      .fallbackLanguage('en')
      .useStaticFilesLoader({
        prefix: '/locales/',
        suffix: '.json'
      })
      .useCookieStorage();
  })

  // Central Variable for Watching Online/Offline Events
  .run(function($window, $rootScope, $state, $stateParams, storageService) {
    //storageService.clear();
    storageService.loadFixtures();

    $rootScope.online = navigator.onLine;

    $window.addEventListener('offline', function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      });
    }, false);

    $window.addEventListener('online', function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      });
    }, false);

    // Convenience property to get the current state
    $rootScope.$state = $state;

    // Default state
    $state.go('home.index.mainActivity');
  });
