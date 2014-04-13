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
     //attach fast-click to UI to remove 300ms tap delay on mobile version
    FastClick.attach(document.body);

    //load fixtures if not loaded yet.
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
