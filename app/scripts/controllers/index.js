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
          controller: function($scope, $window) {
            $scope.online = $window.navigator.onLine;

            var toggleOnline = function(event) {
              $window.addEventListener(event, function() {
                $scope.online = !$scope.online;
                $scope.$digest();
              }, false);
            };

            var states = ['online', 'offline'];
            for(var i = 0, len = states.length; i < len; i++) {
              toggleOnline(states[i]);
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
