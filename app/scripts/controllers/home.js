'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      abstract: true,
      templateUrl: 'views/home/index.html',
      resolve: {
        currentFacility: function(facilityFactory) {
          return facilityFactory.getCurrentFacility();
        },
        facilityLocation: function(currentFacility, locationsFactory) {
          return locationsFactory.get(currentFacility.location);
        }
      },
      controller: function($scope, currentFacility, facilityLocation) {
        $scope.currentFacility = currentFacility;
        $scope.facilityLocation = facilityLocation;
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
        controller: function ($scope, currentFacility) {
          $scope.currentFacility = currentFacility;
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
      controller: function ($stateParams, $translate, alertsFactory) {
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
      url: '/dashboard',
      templateUrl: 'views/home/dashboard.html',
      resolve: {
        inventories: function(currentFacility, inventoryFactory) {
          return inventoryFactory.getFacilityInventory(currentFacility.uuid);
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

              if ($stateParams.logSucceeded === "true") {
                $stateParams.logSucceeded = '';
                $translate('addInventorySuccessMessage')
                    .then(function (msg) {
                      alertsFactory.add({message: msg, type: 'success'});
                    });
              }

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

        var lt = -1;
        angular.forEach(inventories, function(inventory) {
          try {
            lt = inventoryRulesFactory.leadTime(inventory);
            lt = $window.humanizeDuration(lt);
            inventory.leadTime = lt;
          } catch(e) {
            inventory.leadTime = e;
          }
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
      resolve: {
        products: function(currentFacility, inventoryFactory) {
          return inventoryFactory.getUniqueProducts(currentFacility.uuid);
        }
      },
      controller: function($scope, settings, products) {
        var inventory = settings.inventory;
        inventory.products = products;
        $scope.inventory = inventory;
      }
    });
  });
