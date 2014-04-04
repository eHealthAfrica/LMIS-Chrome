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
          controller: function($scope, $window, i18n) {
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
    });
  });
