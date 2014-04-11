'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config'
])
  // Load fixture data
  .run(function(storageService) {
    storageService.loadFixtures();
  }).constant('cacheConfig', {
      "id": "lmisChromeAppCache"
    });
