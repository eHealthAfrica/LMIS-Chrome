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
  .run(function(storageService, $rootScope, $state, $window) {

    $window.showSplashScreen = function(event, args){
       $state.go('loadingFixture');
    };

    $window.hideSplashScreen = function(event, args){
      //TODO: if args.completed !== true not all fixtures were loaded or an error occurred while loading fixture,
      $state.go('home.index.home.mainActivity');
    };

    $rootScope.$on('LOADING_COMPLETED', $window.hideSplashScreen);
    $rootScope.$on('START_LOADING', $window.showSplashScreen);

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
