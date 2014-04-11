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
    storageService.getAll().then(function(data){
      if(typeof data === 'undefined' || Object.keys(data).length == 0) 
        storageService.loadFixtures().then(function(result){
          storageService.getAll().then(function(data){
            console.log("finished loading: "+Object.keys(data));
          });
        });
      });
  }).constant('cacheConfig', {
      "id": "lmisChromeAppCache"
    });
