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
          $state.go('home.index.controlPanel');
        });
      }
    })
    .state('home.index.dashboard', {
      url: '/dashboard',
      templateUrl: 'views/home/dashboard.html',
      controller: function($scope) {
        var keys = {
          below: {
            label: 'Below buffer',
            color: 'red'
          },
          buffer: {
            label: 'Buffer',
            color: 'yellow'
          },
          safety: {
            label: 'Safety stock',
            color: 'black'
          },
          max: {
            label: 'Max',
            color: 'grey'
          }
        };

        var values = [
          {
            label: 'BCG',
            below: -19,
            buffer: 405,
            safety: 0,
            _max: 1000
          },
          {
            label: 'TT',
            below: 0,
            buffer: 348,
            safety: 384,
            _max: 1500
          },
          {
            label: 'Penta',
            below: 0,
            buffer: 310,
            safety: 272,
            _max: 1200
          }
        ];

        var chart = [];
        angular.forEach(Object.keys(keys), function(key) {
          var series = {};
          series.key = keys[key].label;
          series.color = keys[key].color;
          series.values = [];
          angular.forEach(values, function(value) {
            if(key === 'max') {
              value[key] = value._max - (value.buffer + value.safety);
            }
            series.values.push([value.label, value[key]]);
          });
          chart.push(series);
        });

        $scope.inventoryChart = chart;
        $scope.inventoryKeys = keys;
        $scope.inventoryValues = values;
      }
    });
  });
