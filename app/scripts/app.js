'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config'
])
  // Load fixture data
  .run(function(storageService, syncService) {
    storageService.loadFixtures();

    syncService.sync(storageService.APP_CONFIG);
  });
