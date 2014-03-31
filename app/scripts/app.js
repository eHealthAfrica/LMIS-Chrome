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
    .config(function ($uiViewScrollProvider, $anchorScrollProvider) {
      $uiViewScrollProvider.useAnchorScroll();
      $anchorScrollProvider.disableAutoScrolling();
    })

  // Central Variable for Watching Online/Offline Events
    .run(function(storageService) {
      storageService.loadFixtures();
    });
