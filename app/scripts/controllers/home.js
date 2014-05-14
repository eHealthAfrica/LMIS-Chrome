'use strict';

angular.module('lmisChromeApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/main-activity');
    $stateProvider.state('home', {
      parent: 'root.index',
      templateUrl: 'views/home/index.html',
      resolve: {
        appConfig: function(appConfigService){
          return appConfigService.getCurrentAppConfig();
        },
        isStockCountReminderDue: function(appConfigService, appConfig){
          if(typeof appConfig !== 'undefined'){
            return appConfigService.isStockCountDue(appConfig.reminderDay);
          }
          return false;
        }
      },
      controller: function(appConfig, $state, $scope, isStockCountReminderDue, $rootScope) {
        if (typeof appConfig === 'undefined') {
          $state.go('appConfigWelcome');
        }else{
          $scope.facility = appConfig.appFacility.name;
          if(typeof $rootScope.isStockCountDue === 'undefined' || $rootScope.isStockCountDue === true){
            $rootScope.isStockCountDue = isStockCountReminderDue;
          }

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
      url: '/main-activity?appConfigResult&stockResult&storageClear&stockOutBroadcastResult&surveySuccessMsg&ccuBreakdownReportResult',
      data: {
        label: 'Home'
      },
      views: {
        'activities': {
          templateUrl: 'views/home/main-activity.html',
          controller: function ($stateParams, i18n, alertsFactory) {

            if ($stateParams.storageClear !== null) {
              alertsFactory.success(i18n('clearStorageMsg'));
              $stateParams.storageClear = null;
            }

            if ($stateParams.ccuBreakdownReportResult !== null) {
              alertsFactory.success(i18n('ccuBreakdownReportSuccessMsg'));
              $stateParams.ccuBreakdownReportResult = null;
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

            if ($stateParams.surveySuccessMsg !== null) {
              alertsFactory.success($stateParams.surveySuccessMsg);
              $stateParams.surveySuccessMsg = null;
            }

          }
        },
        'charts': {
          templateUrl: 'views/dashboard/dashboard.html',
          resolve: {
            stockOutList: function(stockOutBroadcastFactory){
              return stockOutBroadcastFactory.getAll();
            },
            stockCountIsAvailable: function(appConfigService, appConfig){
              if(angular.isDefined(appConfig)){
                return appConfigService.isStockCountDue(appConfig.reminderDay);
              }
              else{
                return true;
              }
            }
            /**
             * Returns an array of {name: product type name, count: total number
             * in facility (as of last stock count)}
             */

          },
          controller: function($q, $log, $scope, i18n, dashboardfactory, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService, cacheService, stockOutList, utility, $rootScope, stockCountIsAvailable) {
            var keys = [
              {
                key: 'daysToReorder',
                label: i18n('daysLeft'),
                color:  '#9954bb'
              },
              {
                key: 'daysOfStock',
                color: '#666666',
                label: i18n('daysStock')
              }
            ];

            var getProductTypeCounts = function ($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService, cacheService) {
              var deferred = $q.defer();

              var productTypeInfo = {};
              if(typeof appConfig === 'undefined'){
                deferred.resolve(productTypeInfo);
                return deferred.promise;
              }

              var cacheProductTypes = cacheService.get(cacheService.PRODUCT_TYPE_INFO);
              if(typeof cacheProductTypes !== 'undefined'){
                deferred.resolve(cacheProductTypes);
                return deferred.promise;
              }

              var currentFacility = appConfig.appFacility;
              var promises = [];
              promises.push(appConfigService.getProductTypes());
              $q.all(promises)
                .then(function(res) {
                  var types =  res[0];
                  var productTypeInfo = [];
                  var innerPromises = [];
                  // jshint loopfunc: true
                  for(var i in types) {
                    productTypeInfo[types[i].uuid] = {
                      name: types[i].code
                    };
                    (function (i) {
                      innerPromises.push(inventoryRulesFactory.daysOfStock(currentFacility, types[i].uuid)
                        .then(
                          function (stockLevel) {
                            productTypeInfo[types[i].uuid].daysOfStock = stockLevel;
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
                    //cache the result
                    cacheService.put(cacheService.PRODUCT_TYPE_INFO, productTypeInfo);
                    deferred.resolve(productTypeInfo);
                  });
                })
                .catch(function (reason) {
                  $log.error(reason);
                  deferred.reject(reason);
                });
              return deferred.promise;
            };

            if($rootScope.showChart === true || !stockCountIsAvailable){
              $rootScope.showChart = true;
              getProductTypeCounts($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService, cacheService).then(
                function(productTypeCounts) {
                var values = [], product = {}, stockOutWarning = [];
                var filterStockCountWithNoStockOutRef = function(stockOutList){
                  return stockOutList.filter(function(element){
                    var dayTest = function () {
                      var now = new Date().getTime(),
                          createdTime = new Date(element.created).getTime(),
                          currentReminderDate = utility.getWeekRangeByDate(new Date(), appConfig.reminderDay).reminderDate,
                          lastCountDate = currentReminderDate.getTime() - (1000 * 60 * 60 * 24 * appConfig.stockCountInterval);
                      if (now >= currentReminderDate.getTime()) {
                        return (currentReminderDate.getTime() < createdTime);
                      } else {
                        return (lastCountDate < createdTime );
                      }
                    };
                    return element.productType.uuid === uuid && dayTest();
                  });
                };

                for(var uuid in productTypeCounts) {
                  product = productTypeCounts[uuid];
                  //filter out stock count with no reference to stock out broadcast since the last stock count
                  var filtered = filterStockCountWithNoStockOutRef(stockOutList);

                  //create a uuid list of products with zero or less reorder days
                  if(product.daysToReorder <= 0 && filtered.length === 0){
                    stockOutWarning.push(uuid);
                  }
                  values.push({
                    label: product.name,
                    daysOfStock: Math.floor(product.daysOfStock),
                    daysToReorder: Math.floor(product.daysToReorder)
                  });
                }
                $scope.stockOutWarning = stockOutWarning;
                $scope.stockOutWarningMsg = i18n('stockOutWarningMsg', (stockOutWarning.length).toString());
                //var format = d3.format(',.4f');
                $scope.roundLegend = function(){
                  return function(d){
                      return d3.round(d);
                    };
                };

                $scope.productTypesChart = dashboardfactory.chart(keys, values);

              }, function(err) {
                console.log('getProductTypeCounts Error: '+err);
              });
            }else{
              $rootScope.showChart = !stockCountIsAvailable;
            }

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
      }
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
