'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
      .state('inventoryListView', {
        url: '/inventory-list-view',
        templateUrl: '/views/inventory/index.html',
        controller: 'inventoryMainCtrl'
      }).state('addInventory', {
        url: '/add-inventory',
        templateUrl: '/views/inventory/add-inventory.html',
        controller: function () {

        }
      });
})
/**
 * Controller for showing inventory
 */
    .controller('inventoryMainCtrl', function ($scope, storageService, $filter, ngTableParams, visualMarkerService) {
      storageService.get(storageService.BATCH).then(function (data) {
        $scope.batches = data;
      });

      storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
        $scope.presentations = data;
      });

      storageService.get(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });


      storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
        $scope.product_types = data;
      });

      storageService.get(storageService.CCU).then(function (data) {
        $scope.cceList = data;
      });

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;

      storageService.all(storageService.INVENTORY).then(function (data) {
        // Table defaults
        var params = {
          page: 1,
          count: 10,
          sorting: {
            expiration_date: 'asc'
          }
        };

        // Pagination
        var resolver = {
          total: data.length,
          getData: function ($defer, params) {
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            $defer.resolve(orderedData.slice(
                (params.page() - 1) * params.count(),
                params.page() * params.count()
            ));
          }
        }

        $scope.getTotalQuantity = function (inventoryLine) {
          var inventoryLineBatch = $scope.batches[inventoryLine.batch];
          var presentation = $scope.presentations[inventoryLineBatch.presentation];
          var totalQuantity = presentation.value * inventoryLine.quantity;
          return totalQuantity;
        };

        $scope.getProductTypeUOM = function (inventoryLine) {
          var inventoryLineBatch = $scope.batches[inventoryLine.batch];
          var product = $scope.product_types[inventoryLineBatch.product];
          var product_uom = $scope.uomList[product.base_uom];
          return product_uom;
        };

        $scope.getStorageVolume = function (inventoryLine) {
          var inventoryLineBatch = $scope.batches[inventoryLine.batch];
          var storageVolume = inventoryLineBatch.packed_volume * inventoryLine.quantity;
          return storageVolume;
        }


        $scope.inventory = new ngTableParams(params, resolver);
      });


    })
/**
 * Add to inventory controller
 */
    .controller('addInventoryCtrl', function ($scope, storageService, $location) {

      $scope.inventory = {}

      storageService.all(storageService.BATCH).then(function (data) {
        console.log()
        $scope.productItems = data;
      });

      storageService.all(storageService.CCU).then(function (data) {
        $scope.cceList = data;
      });

      storageService.all(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });

      $scope.save = function () {
        storageService.insert(storageService.INVENTORY, $scope.inventory).then(function () {
          $location.path('/inventory/index');
        });
        console.log($scope.inventory);
      };

    });



