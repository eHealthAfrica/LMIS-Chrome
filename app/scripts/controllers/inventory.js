'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
      .state('inventoryListView', {
        url: '/inventory-list-view',
        templateUrl: '/views/inventory/index.html',
        controller: 'inventoryMainCtrl',
        data: {
          label: "Inventory List"
        }
      }).state('addInventory', {
        url: '/add-inventory',
        templateUrl: '/views/inventory/add-inventory.html',
        controller: 'addInventoryCtrl',
        data: {
          label: "Add Inventory"
        },
        resolve: {
          productTypes: function (productTypeFactory) {
            return productTypeFactory.getAll();
          },
          programs: function (programsFactory) {
            return programsFactory.getAll();
          },
          uomList: function (uomFactory) {
            return uomFactory.getAll();
          },
          facilities: function(facilityFactory){
            return facilityFactory.getAll();
          }
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
 * addInventoryCtrl is the controller used to manually add bundles that don't exist already on the local storage
 * to the inventory upon arrival.
 */
    .controller('addInventoryCtrl', function ($scope, productTypes, programs, uomList, facilities, batchFactory, storageUnitFactory) {

      //used to hold form data
      $scope.inventory = {
        authorized: false,
        inventoryLines: []
      }

      var id = 0;
      console.log($scope.inventory.inventoryLines);

      //load data used to populate form fields
      $scope.productTypes = productTypes;
      $scope.programs = programs;
      $scope.productTypeBatches = [];
      $scope.isDisabled = true;
      $scope.batchNo = '';
      $scope.uomList = uomList;
      $scope.facilities = facilities;
      $scope.receivingFacilityStorageUnits = []



      $scope.loadProductTypeBatches = function (productTypeUUID) {
        $scope.isDisabled = false;
        batchFactory.getByProductType(productTypeUUID).then(function (data) {
          $scope.productTypeBatches = data;
        });
      }

      $scope.updateBatchNo = function (inventoryLine) {
        console.log(inventoryLine);
//        batchFactory.get(inventoryLine.selectedBatch).then(function (data) {
//          $scope..inventory.inventoryLines.batchNo = data.batch_no;
//        });
      }

      $scope.loadReceivingFacilityStorageUnits = function (facilityUUID) {
        storageUnitFactory.getFacilityStorageUnits(facilityUUID).then(function (data) {
          $scope.receivingFacilityStorageUnits = data;
        });
      }

      $scope.addInventoryLine = function(){
         $scope.inventory.inventoryLines.push({id: id++});
        console.log($scope.inventory.inventoryLines);
      }

      $scope.removeInventoryLine = function(inventoryLine){
        console.log(inventoryLine);
      }

    });



