'use strict';

angular.module('lmisChromeApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/main-activity');
    $stateProvider.state('home', {
      parent: 'root.index',
      abstract: true,
      templateUrl: 'views/home/index.html',
      resolve: {
        appConfig: function(appConfigService){
          return appConfigService.load();
        },
        todayStockCount: function (stockCountFactory) {
          var today = new Date();
          return stockCountFactory.getStockCountByDate(today);
        }
      },
      controller: function($scope, appConfig, todayStockCount, $state, syncService, appConfigService) {
        if (appConfig === undefined) {
          $state.go('appConfigWelcome');
        } else {
          $scope.facility = appConfig.appFacility.name;
          $scope.hasPendingStockCount = (todayStockCount === null);
        }
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
      url: '/main-activity?appConfigResult&stockResult&storageClear&stockOutBroadcastResult',
      templateUrl: 'views/home/main-activity.html',
      data: {
        label: 'Home'
      },
      controller: function ($scope, $stateParams, $log, $state, appConfig, i18n, alertsFactory, syncService, appConfigService) {
        if ($stateParams.storageClear !== null) {
          alertsFactory.success(i18n('clearStorageMsg'));
          $stateParams.storageClear = null;
        }

        if ($stateParams.stockOutBroadcastResult !== null) {
          alertsFactory.success(i18n('stockOutBroadcastSuccessMsg'));
          $stateParams.stockOutBroadcastResult = null;
        }

        if ($stateParams.appConfigResult !== null) {
          alertsFactory.success($stateParams.appConfigResult);
          syncService.syncItem(appConfigService.APP_CONFIG, appConfig)
            .then(function(syncResult){
              $log.info('sync was successful ' +JSON.stringify(syncResult));
            }, function(syncError){
                console.log(syncError);
            });
          $stateParams.appConfigResult = null;
        }

        if($stateParams.stockResult !== null){
          alertsFactory.success($stateParams.stockResult);
          $stateParams.stockResult = null;
        }
      }
    })
    .state('home.index.dashboard', {
      url: '/dashboard',
      templateUrl: 'views/home/dashboard.html',
      abstract: true,
      resolve: {
        settings: function(settingsService) {
          return settingsService.load();
        },
        aggregatedInventory: function($q, $log, appConfig, inventoryFactory, dashboardfactory, settings) {
          var currentFacility = appConfig.appFacility;
          var deferred = $q.defer();
          inventoryFactory.getFacilityInventory(currentFacility.uuid)
            .then(function(inventory) {
              var values = dashboardfactory.aggregateInventory(inventory, settings);
              deferred.resolve(values);
            })
            .catch(function(reason) {
              $log.error(reason);
            });

          return deferred.promise;
        }
      },
      controller: function($scope, settings) {
        if(!('inventory' in settings && 'products' in settings.inventory)) {
          $scope.productsUnset = true;
        }
      },
    })
    .state('home.index.dashboard.chart', {
      url: '',
      resolve: {
        keys: function(dashboardfactory) {
          return dashboardfactory.keys;
        }
      },
      views: {
        'chart': {
          templateUrl: 'views/home/dashboard/chart.html',
          controller: function($scope, $log, dashboardfactory, keys, aggregatedInventory) {
            $scope.inventoryChart = dashboardfactory.chart(keys, aggregatedInventory);
          }
        },
        'table': {
          templateUrl: 'views/home/dashboard/table.html',
          controller: function($scope, settings, aggregatedInventory) {
            var products = settings.inventory.products;

            // Get the service level for use in view
            var serviceLevel = 0;
            for(var i = aggregatedInventory.length - 1; i >= 0; i--) {
              serviceLevel = products[aggregatedInventory[i].label].serviceLevel;
              aggregatedInventory[i].serviceLevel = serviceLevel;
            }

            $scope.products = aggregatedInventory;
          }
        }
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
      controller: function($scope, settings, settingsService, alertsFactory, i18n) {
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
              alertsFactory.success(i18n('settingsSaved'));
            })
            .catch(function() {
              alertsFactory.success(i18n('settingsFailed'));
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
        products: function(appConfig, inventoryFactory) {
          var currentFacility = appConfig.appFacility;
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
