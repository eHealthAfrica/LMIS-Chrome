'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      abstract: true,
      templateUrl: 'views/home/index.html',
      resolve: {
        currentFacility: function($q, facilityFactory, locationsFactory) {
          var deferred = $q.defer();
          facilityFactory.getCurrentFacility().then(function(facility) {
            locationsFactory.get(facility.location).then(function(location) {
              facility.location = location;
              deferred.resolve(facility);
            });
          });
          return deferred.promise;
        }
      },
      controller: function($scope, currentFacility) {
        $scope.currentFacility = currentFacility;
      }
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
      url: '/main-activity?orderNo',
      templateUrl: 'views/home/main-activity.html',
      data: {
        label: 'Home'
      },
      controller: function ($stateParams, $translate, alertsFactory) {
        console.log($stateParams.orderNo);
        if ($stateParams.orderNo !== null) {
          $stateParams.orderNo = null;
          $translate('orderPlacedSuccess', {orderNo: $stateParams.orderNo})
            .then(function (msg) {
              alertsFactory.add({message: msg, type: 'success'});
            });
        }
      }
    })
    .state('home.index.mainActivity.orderType', {
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
      templateUrl: 'views/home/dashboard.html',
      resolve: {
        inventories: function($q, facilityFactory, inventoryFactory) {
          // XXX: Shouldn't need to re-resolve the current facility since
          //      we have it in the top-level state ('home') as
          //      `$scope.currentFacility`
          var deferred = $q.defer();
          facilityFactory.getCurrentFacility().then(function(facility) {
            inventoryFactory.getFacilityInventory(facility.uuid)
              .then(function(inventory) {
                deferred.resolve(inventory);
              });
          });
          return deferred.promise;
        }
      },
      controller: function($scope, inventories, inventoryRulesFactory, $window) {
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
        angular.forEach(Object.keys(keys), function (key) {
          var series = {};
          series.key = keys[key].label;
          series.color = keys[key].color;
          series.values = [];
          angular.forEach(values, function (value) {
            if (key === 'max') {
              value[key] = value._max - (value.buffer + value.safety);
            }
            series.values.push([value.label, value[key]]);
          });
          chart.push(series);
        });

        $scope.inventoryChart = chart;
        $scope.inventoryKeys = keys;
        $scope.inventoryValues = values;

        angular.forEach(inventories, function(inventory) {
          var lt = inventoryRulesFactory.leadTime(inventory);
          lt = $window.humanizeDuration(lt);
          inventory.leadTime = lt;
        });

        $scope.inventories = inventories;
      }
    })
    .state('home.index.settings', {
      url: '/settings',
      abstract: true,
      templateUrl: 'views/home/settings.html',
      resolve: {
        settings: function(settingsService) {
          return settingsService.load();
        }
      },
      controller: function($scope, settings) {
        settings.facility = {};
        settings.inventory = {};
        $scope.settings = settings;
      }
    })
    .state('home.index.settings.facility', {
      templateUrl: 'views/home/settings/facility.html',
      controller: function($scope, settings) {
        $scope.facility = settings.facility;
      }
    })
    .state('home.index.settings.inventory', {
      templateUrl: 'views/home/settings/inventory.html',
      controller: function($scope, settings) {
        $scope.inventory = settings.inventory;
      }
    });
  });
