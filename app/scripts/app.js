'use strict';

angular.module('lmisChromeApp', [
  'ui.bootstrap',
  'ui.router',
  'tv.breadcrumbs',
  'pouchdb',
  'config'
])
  // Load fixture data
  .run(function(storageService, $rootScope, $modal) {
    $modal.open({
          templateUrl: 'views/index/loading-fixture-screen.html',
          backdrop: 'static',
          keyboard: false,
          controller: function ($modalInstance) {
            $rootScope.$modalInstance = $modalInstance;
          }
        });

    $rootScope.$on('LOADING_FIXTURE', function(event, args){
      if(args.completed){
        if($rootScope.$modalInstance){
          $rootScope.$modalInstance.close(true);
        }
      }else{
        $modal.open({
          templateUrl: 'views/index/loading-fixture-screen.html',
          backdrop: 'static',
          keyboard: false,
          controller: function ($modalInstance) {
            $rootScope.$modalInstance = $modalInstance;
          }
        });
      }
    });


    //attach fast-click to UI to remove 300ms tap delay on mobile version
    try{
      FastClick.attach(document.body);
    }catch(e){
      console.log(e);
    }

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
