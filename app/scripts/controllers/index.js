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
            controller: function($scope, $window, i18n, appConfigService, deviceInfoFactory, backgroundSyncService, syncService) {

              $scope.states = {
                online: i18n('online'),
                offline: i18n('offline')
              };

              $scope.status = {
                label: deviceInfoFactory.isOnline() ? $scope.states.online : $scope.states.offline
              };

              var toggleOnline = function(event) {
                $window.addEventListener(event, function(e) {
                  $scope.status = {
                    label: $scope.states[e.type]
                  };
                  $scope.$digest();

                  //this one sends when toggle from on to off and vice versa. I think we only need from off to on and on app start!
                  syncService.syncOfflineAnalytics().finally(function(){
                    console.log('offline reports send to ga server.');
                  });

                  //trigger background syncing
                  backgroundSyncService.startBackgroundSync()
                    .finally(function() {
                      console.log('updateAppConfigAndStartBackgroundSync  triggered on device connection ' +
                        'status change has been completed.');
                    });

                }, false);
              };

              for (var state in $scope.states) {
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
        parent: 'root.index',
        templateUrl: 'views/index/loading-fixture-screen.html',
        url: '/loading-fixture',
      })
      .state('migrationScreen', {
        parent: 'root.index',
        templateUrl: 'views/index/migration-screen.html',
        url: '/migration-screen'
      });
  });
