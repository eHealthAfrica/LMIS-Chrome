'use strict';

angular.module('lmisChromeApp')
    .config(function ($stateProvider) {
      $stateProvider.state('home', {
        url: '/home',
        abstract: true,
        templateUrl: 'views/home/index.html'
      })
          .state('home.index', {
            abstract: true,
            views: {
              'nav': {
                templateUrl: 'views/home/nav.html',
                controller: function ($scope, $state) {
                  $scope.$state = $state;
                }
              },
              'sidebar': {
                templateUrl: 'views/home/sidebar.html'
              }
            }
          })
          .state('home.index.controlPanel', {
            url: '/control-panel',
            templateUrl: 'views/home/control-panel.html',
            data: {
              label: 'Home'
            }
          })
          .state('home.index.mainActivity', {
            url: '/main-activity',
            templateUrl: 'views/home/main-activity.html',
            data: {
              label: 'Home'
            }
          })
          .state('home.index.controlPanel.orderType', {
            url: '/place-order',
            controller: function ($state, $modal) {
              var modal = $modal.open({
                templateUrl: 'views/home/partials/order-type.html',
              });
              modal.result.catch(function () {
                $state.go('home.index.mainActivity');
              });
            }
          })
          .state('home.index.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/home/dashboard.html'
          });
    });
