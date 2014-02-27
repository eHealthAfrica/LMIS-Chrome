'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('home', {
      abstract: true,
      templateUrl: 'views/home/index.html'
    })
    .state('home.index', {
      views: {
        'nav': {
          templateUrl: 'views/home/nav.html',
          controller: function($scope, $state) {
            $scope.$state = $state;
          }
        },
        'sidebar': {
          templateUrl: 'views/home/sidebar.html'
        }
      }
    })
    .state('home.index.controlPanel', {
      templateUrl: 'views/home/control-panel.html',
      data: {
        label: 'Home'
      }
    })
    .state('home.index.controlPanel.orderType', {
      controller: function($state, $modal) {
        var modal = $modal.open({
          templateUrl: 'views/home/partials/order-type.html',
        });
        modal.result.catch(function() {
          $state.go('home.index.controlPanel');
        });
      }
    })
    .state('home.index.dashboard', {
      templateUrl: 'views/home/dashboard.html'
    });
  });
