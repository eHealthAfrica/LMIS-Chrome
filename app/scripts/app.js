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
  .run(function(storageService, $rootScope, $state, $window, syncService) {

    $window.showSplashScreen = function(){
      $state.go('loadingFixture');
    };

    $window.hideSplashScreen = function(){
      $state.go('home.index.home.mainActivity');
    };

    $rootScope.$on('LOADING_COMPLETED', $window.hideSplashScreen);
    $rootScope.$on('START_LOADING', $window.showSplashScreen);

    if(typeof FastClick !== 'undefined'){
      FastClick.attach(document.body);
    }

    //load fixtures if not loaded yet.
    storageService.loadFixtures().then(function(){
      //trigger background syncing after loading fixtures.
      syncService.backgroundSync()
          .finally(function () {
            console.log('background syncing trigger on start up has been completed!');
          });
      storageService.getAll().then(function (data) {
        console.log('finished loading: ' + (Object.keys(data)).join('\n'));
      });
    });

  }).config(['$compileProvider', function ($compileProvider) {
      //to bye-pass Chrome app CSP for images.
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
    }
  ]);
