'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config'
])
  // Disable ui-router auto scrolling
  .config(function($uiViewScrollProvider, $anchorScrollProvider) {
    $uiViewScrollProvider.useAnchorScroll();
    $anchorScrollProvider.disableAutoScrolling();
  })

  // Load fixture data
  .run(function(storageService) {
    storageService.loadFixtures();
  });
