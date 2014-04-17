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
        }
      },
      controller: function($scope, appConfig, appConfigService, $state) {
        if (appConfig === undefined) {
          $state.go('appConfigWelcome');
        } else {
          $scope.facility = appConfig.appFacility.name;
          appConfigService.isStockCountDue(appConfig).then(function(result){
            $scope.hasPendingStockCount = result;
          });
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
    .state('home.index.home', {
      abstract: true,
      templateUrl: 'views/home/home.html'
    })
    .state('home.index.home.mainActivity', {
      url: '/main-activity?appConfigResult&stockResult&storageClear&stockOutBroadcastResult',
      data: {
        label: 'Home'
      },
      views: {
        'activities': {
          templateUrl: 'views/home/main-activity.html',
          controller: function ($scope, $stateParams, $log, $state, appConfig, i18n, alertsFactory) {
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
              $stateParams.appConfigResult = null;
            }

            if($stateParams.stockResult !== null){
              alertsFactory.success($stateParams.stockResult);
              $stateParams.stockResult = null;
            }
          }
        },
        'charts': {
          templateUrl: 'views/dashboard/dashboard.html',
          resolve: {
            /**
             * Returns an array of {name: product type name, count: total number
             * in facility (as of last stock count)}
             */
            
          },
          controller: function($q, $log, $scope, i18n, dashboardfactory, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService) {
            var keys = [
              {
                key: 'count',
                label: i18n('count')
              },
              {
                key: 'daysToReorder',
                label: i18n('daysLeft')
              }
            ];

            var getProductTypeCounts = function ($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService) {
              var deferred = $q.defer();
              var productTypeInfo = {};
              if(typeof appConfig === 'undefined'){
                deferred.resolve(productTypeInfo);
                return deferred.promise;
              }
              var currentFacility = appConfig.appFacility;
              var promises = [];
              //TODO what a pain can't we have config service return real objects? thing is that creates an added dependency..
              promises.push(appConfigService.getProductTypes());
              promises.push(productTypeFactory.getAll());
              $q.all(promises)
                .then(function(res) {
                  var typeIds = res[0];
                  var actualTypes = res[1];
                  var types = actualTypes.filter(function (t) {
                    return typeIds.indexOf(t.uuid) !== -1;
                  });
                  var productTypeInfo = [];
                  var innerPromises = [];
                  // jshint loopfunc: true
                  for(var i in types) {
                    productTypeInfo[types[i].uuid] = {
                      name: types[i].name
                    };
                    (function (i) {
                      innerPromises.push(inventoryRulesFactory.getStockLevel(currentFacility, types[i].uuid)
                        .then(
                          function (stockLevel) {
                            productTypeInfo[types[i].uuid].count = stockLevel;
                          },
                          function (err) {
                            deferred.reject(err);
                          })
                      );
                      innerPromises.push(inventoryRulesFactory.daysToReorderPoint(currentFacility, types[i].uuid)
                        .then(
                          function (daysToReorder) {
                            productTypeInfo[types[i].uuid].daysToReorder = daysToReorder;
                          },
                          function (err) {
                            deferred.reject(err);
                          })
                      );
                    })(i);
                  }
                  $q.all(innerPromises).then(function() {
                    deferred.resolve(productTypeInfo);
                  });
                })
                .catch(function (reason) {
                  $log.error(reason);
                  deferred.reject(reason);
                });
              return deferred.promise;
            }

            getProductTypeCounts($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService).then(
              function(productTypeCounts) {
              var values = [], product = {}; 
              // TODO: unnecessary transposition
              for(var uuid in productTypeCounts) {
                product = productTypeCounts[uuid];
                values.push({
                  label: product.name,
                  count: product.count,
                  daysToReorder: product.daysToReorder
                });
              }

              $scope.productTypesChart = dashboardfactory.chart(keys, values);
            }, function(err) {

            });

           
            
          }
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
            .then(function (inventory) {
              var values = dashboardfactory.aggregateInventory(inventory, settings);
              deferred.resolve(values);
            })
            .catch(function (reason) {
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
