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
        isStockCountReminderDue: function(stockCountFactory, appConfig){
          if(typeof appConfig !== 'undefined'){
            return stockCountFactory.isStockCountDue(appConfig.stockCountInterval, appConfig.reminderDay);
          }
        }
      },
      controller: function(appConfig, $state, $scope, isStockCountReminderDue, $rootScope, reminderFactory, i18n) {
        if (typeof appConfig === 'undefined') {
          $state.go('appConfigWelcome');
        }else{
          $scope.facility = appConfig.facility.name;
          if (isStockCountReminderDue === true) {
            //FIXME: move stock count reminder object to a factory function, stock count?? or reminderFactory.
            reminderFactory.warning({id: reminderFactory.STOCK_COUNT_REMINDER_ID, text: i18n('stockCountReminderMsg'),
              link: 'stockCountForm', icon: 'views/reminder/partial/stock-count-icon.html'});
          } else {
            reminderFactory.remove(reminderFactory.STOCK_COUNT_REMINDER_ID);
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
      url: '/main-activity',
      data: {
        label: 'Home'
      },
      views: {
        'activities': {
          templateUrl: 'views/home/main-activity.html',
          controller: function ($stateParams, i18n, growl, alertFactory, $scope) {

            var alertQueue = alertFactory.getAll();
            for(var i in alertQueue){
              var alert = alertQueue[i];
              growl.success(alert.msg);
              alertFactory.remove(alert.id);
            }

            $scope.openMain = true;

          }
        },
        'charts': {
          templateUrl: 'views/dashboard/dashboard.html',
          resolve: {
            stockOutList: function(stockOutBroadcastFactory){
              return stockOutBroadcastFactory.getAll();
            }
          },
          controller: function($q, $log, $scope, $window, i18n, dashboardfactory, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService, cacheService, stockOutList, utility, $rootScope, isStockCountReminderDue, stockCountFactory) {
            var keys = [
              {
                key: 'stockBelowReorder',
                label: i18n('stockBelow'),
                color:  '#ff7518'
              },
              {
                key: 'stockAboveReorder',
                label: i18n('stockAbove'),
                color: '#666666'
              }
            ];

            var getProductTypeCounts = function ($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService) {
              var deferred = $q.defer();

              var productTypeInfo = {};
              if(typeof appConfig === 'undefined'){
                deferred.resolve(productTypeInfo);
                return deferred.promise;
              }

              var currentFacility = appConfig.facility;
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
                      innerPromises.push(inventoryRulesFactory.getStockLevel(currentFacility, types[i].uuid)
                        .then(
                          function (stockLevel) {
                            var uuid = types[i].uuid;
                            productTypeInfo[uuid].stockLevel = stockLevel;
                          },
                          function (err) {
                            deferred.reject(err);
                          })
                      );
                      innerPromises.push(inventoryRulesFactory.bufferStock(currentFacility, types[i].uuid)
                        .then(
                          function (bufferStock) {
                            productTypeInfo[types[i].uuid].bufferStock = bufferStock;
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
            };

            $scope.showChart = !isStockCountReminderDue;
            if($scope.showChart){
              getProductTypeCounts($q, $log, inventoryRulesFactory, productTypeFactory, appConfig, appConfigService, stockCountFactory).then(
                function(productTypeCounts) {
                var values = [], product = {}, stockOutWarning = [];
                var filterStockCountWithNoStockOutRef = function(stockOutList){

                  return stockOutList.filter(function(element){
                    var dayTest = function () {
                      var createdTime = new Date(element.created).getTime();
                      var stockCountDueDate  = stockCountFactory.getStockCountDueDate(appConfig.stockCountInterval, appConfig.reminderDay);
                      return stockCountDueDate.getTime() < createdTime;
                    };
                    return element.productType.uuid === uuid && dayTest();
                  });
                };

                for(var uuid in productTypeCounts) {
                  product = productTypeCounts[uuid];
                  //skip prods where we don't have inventory rule information
                  if(product.bufferStock < 0)
                    continue;
                  //filter out stock count with no reference to stock out broadcast since the last stock count
                  var filtered = filterStockCountWithNoStockOutRef(stockOutList);

                  //create a uuid list of products with zero or less reorder days
                  if(product.stockLevel <= product.bufferStock && filtered.length === 0){
                    stockOutWarning.push(uuid);
                  }

                  values.push({
                    label: utility.ellipsize(product.name, 7),
                    stockAboveReorder: inventoryRulesFactory.stockAboveReorder(
                      product.stockLevel, product.bufferStock
                    ),
                    stockBelowReorder: inventoryRulesFactory.stockBelowReorder(
                      product.stockLevel, product.bufferStock
                    )
                  });
                }
                $scope.stockOutWarning = stockOutWarning;
                var items = (stockOutWarning.length > 1) ? i18n('items') : i18n('item');
                $scope.stockOutWarningMsg = i18n('stockOutWarningMsg', [(stockOutWarning.length).toString(), items]);
                //var format = d3.format(',.4f');
                $scope.roundLegend = function(){
                  return function(d){
                    return $window.d3.round(d);
                  };
                };

                $scope.productTypesChart = dashboardfactory.chart(keys, values);

              }, function(err) {
                console.log('getProductTypeCounts Error: '+err);
              });
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
          var currentFacility = appConfig.facility;
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
      controller: function($scope, settings, settingsService, growl, i18n) {
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
              growl.success(i18n('settingsSaved'));
            })
            .catch(function() {
              growl.success(i18n('settingsFailed'));
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
          var currentFacility = appConfig.facility;
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
    })
    .state('contact', {
      parent: 'root.index',
      url: '/contact',
      templateUrl: 'views/home/contact.html'
    });
  });
