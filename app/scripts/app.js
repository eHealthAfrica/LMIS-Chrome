'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config',
  'nvd3ChartDirectives'
])
  // Load fixture data
  .run(function(storageService, $rootScope, $state) {

    $rootScope.$on('LOADING_COMPLETED', function(event, args){
      //TODO: if args.completed !== true not all fixtures were loaded or an error occurred while loading fixture,
      // do something.
      console.log('finished loading fixture');
      $state.go('home.index.home.mainActivity');
    });

    $rootScope.$on('START_LOADING', function(event, args){
       console.log('started loading fixture');
       $state.go('loadingFixture');
    });

    if(typeof FastClick !== 'undefined'){
      FastClick.attach(document.body);
    }

    //load fixtures if not loaded yet.
    storageService.loadFixtures().then(function(result){
      storageService.getAll().then(function(data){
        console.log("finished loading: "+Object.keys(data));
      });
    });

  });
