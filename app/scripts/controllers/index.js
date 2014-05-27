'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('root', {
      url: '',
      abstract: true,
      templateUrl: 'views/index/index.html'
    })
    .state('root.index', {
      abstract: true,
      views: {
        'header': {
          templateUrl: 'views/index/header.html',
          controller: function($scope, $window, i18n, syncService, $interval) {
            var states = {
              online: i18n('online'),
              offline: i18n('offline')
            };

            var online = $window.navigator.onLine;
            $scope.status = {
              online: online,
              label: online ? states.online : states.offline
            };

            var toggleOnline = function(event) {
              $window.addEventListener(event, function() {
                $scope.status = {
                  online: !$scope.status.online,
                  label: states[event]
                };
                $scope.$digest();

                //start background syncing if device can connect to remote server
                var THIRTY_SECS_DELAY = 30 * 1000;//30 secs
                var counter = 0;
                var MAX_CONNECTION_ATTEMPT = 10;
                var syncRequest = $interval(function () {
                  if(counter < MAX_CONNECTION_ATTEMPT){
                    syncService.canConnect()
                        .then(function(result){
                          if(result === true){
                            counter = MAX_CONNECTION_ATTEMPT; //cancel further connection attempt
                            syncService.backgroundSyncingOfPendingRecords()
                                .finally(function(){
                                  $scope.$$phase || $scope.$digest(); //update views
                                });
                          }else{
                            counter = counter + 1;
                          }
                        })
                        .catch(function(){
                          counter = counter + 1;
                        });
                  }else{
                    $interval.cancel(syncRequest);
                  }
                }, THIRTY_SECS_DELAY);

                $scope.$on('$destroy', function(){
                  //free $interval to avoid memory leaks.
                  $interval.cancel(syncRequest);
                });

              }, false);
            };

            for(var state in states) {
              toggleOnline(state);
            }
          }
        },
        'breadcrumbs': {
          templateUrl: 'views/index/breadcrumbs.html',
          controller: function($scope, $state) {
            $scope.state = $state;
          }
        },
        'alerts': {
          templateUrl: 'views/index/alerts.html'
        },
        'content': {},
        'footer': {
          templateUrl: 'views/index/footer.html',
          controller: function($scope, $window) {
            var manifest = $window.chrome.runtime.getManifest();
            $scope.year = new Date().getFullYear();
            $scope.version = manifest.version;
          }
        }
      }
    })
    .state('loadingFixture', {
      templateUrl: 'views/index/loading-fixture-screen.html'
    });
  });
