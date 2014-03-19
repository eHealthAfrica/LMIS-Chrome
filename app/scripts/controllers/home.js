'use strict';

angular.module('lmisChromeApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/main-activity');
    $stateProvider.state('home', {
      url: '',
      abstract: true,
      templateUrl: 'views/home/index.html',
      resolve: {
        currentFacility: function (facilityFactory) {
          return facilityFactory.getCurrentFacility();
        },
        facilityLocation: function (currentFacility, locationsFactory) {
          return locationsFactory.get(currentFacility.location);
        },
        todayStockCount: function (stockCountFactory) {
          var today = new Date();
          return stockCountFactory.getStockCountByDate(today);
        }
      },
      controller: function($scope, currentFacility, facilityLocation, todayStockCount) {
        $scope.facility = currentFacility.name + ' (' +
          facilityLocation.name + ')';
        $scope.hasPendingStockCount = (todayStockCount === null);
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
      url: '/main-activity?orderNo&stockResult',
      templateUrl: 'views/home/main-activity.html',
      data: {
        label: 'Home'
      },
      controller: function ($scope, $stateParams, $modal, $state, $translate, alertsFactory) {

        if ($stateParams.orderNo !== null) {
          $stateParams.orderNo = null;
          $translate('orderPlacedSuccess', {orderNo: $stateParams.orderNo})
            .then(function (msg) {
              alertsFactory.add({message: msg, type: 'success'});
            });
        }

        if($stateParams.stockResult !== null){
          alertsFactory.add({message: $stateParams.stockResult, type: 'success'});
          $stateParams.stockResult = null;
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
      url: '/dashboard?logIncomingMsg',
      templateUrl: 'views/home/dashboard.html',
      resolve: {
        inventories: function(currentFacility, inventoryFactory) {
          return inventoryFactory.getFacilityInventory(currentFacility.uuid);
        },
        settings: function(settingsService) {
          return settingsService.load();
        }
      },
      controller: function($scope, $stateParams, $translate, alertsFactory, inventories, inventoryRulesFactory, $window, settings, dashboardfactory, $log) {
        if($stateParams.logIncomingMsg !== undefined && $stateParams.logIncomingMsg !== '') {
          alertsFactory.add({message: $stateParams.logIncomingMsg, type: 'success'});
          $stateParams.logIncomingMsg = null;
        }

        if(!('inventory' in settings && 'products' in settings.inventory)) {
          $scope.productsUnset = true;
          return;
        }

        // Plot the chart
        var values = dashboardfactory.aggregateInventory(inventories, settings);
        dashboardfactory.keys()
          .then(function(keys) {
            $scope.inventoryChart = dashboardfactory.chart(keys, values);
          })
          .catch(function(reason) {
            $log.error(reason);
          });
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
      controller: function($scope, settings, settingsService, alertsFactory, $translate) {
        var fields = ['facility', 'inventory'];
        for(var i = fields.length - 1; i >= 0; i--) {
          if(!(fields[i] in settings)) {
            settings[fields[i]] = {};
          }
        }

        $scope.settings = settings;
        $scope.save = function(settings) {
          settingsService.save(settings)
            .then(function() {
              $translate('settingsSaved').then(function(settingsSaved) {
                alertsFactory.add({
                  message: settingsSaved,
                  type: 'success'
                });
              });
            })
            .catch(function() {
              $translate('settingsFailed').then(function(settingsFailed) {
                alertsFactory.add({
                  message: settingsFailed,
                  type: 'danger'
                });
              });
            });
        };
      }
    })
    .state('home.index.settings.facility', {
      url: '/facility',
      templateUrl: 'views/home/settings/facility.html',
      controller: function($scope, settings) {
        $scope.facility = settings.facility;
      }
    })
    .state('home.index.settings.inventory', {
      url: '/inventory',
      templateUrl: 'views/home/settings/inventory.html',
      resolve: {
        products: function(currentFacility, inventoryFactory) {
          return inventoryFactory.getUniqueProducts(currentFacility.uuid);
        }
      },
      controller: function($scope, settings, products) {
        var inventory = settings.inventory;

        // User hasn't made any settings
        if(!('products' in inventory)) {
          inventory.products = {};
        }

        // Check if a product has been added since the settings were saved
        for(var code in products) {
          if(!(code in inventory.products)) {
            inventory.products[code] = products[code];
          }
        }
        $scope.inventory = inventory;
      }
    });
  });
