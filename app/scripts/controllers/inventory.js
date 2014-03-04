'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
      .state('inventoryListView', {
        url: '/inventory-list-view',
        templateUrl: '/views/inventory/index.html',
        controller: 'inventoryMainCtrl',
        data: {
          label: "Inventory List"
        },
        resolve: {
          inventoryLines: function (inventoryFactory) {
            //TODO: set default facility uuid/object to facility of logged in user.
            return inventoryFactory.getAll("d48a39fb-6d37-4472-9983-bc0720403719");
          }
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
          facilities: function (facilityFactory) {
            return facilityFactory.getAll();
          }
        }
      });
})
/**
 * Controller for showing inventory
 */
    .controller('inventoryMainCtrl', function ($scope, inventoryLines, $filter, ngTableParams, visualMarkerService) {

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;

      // Table defaults
      var params = {
        page: 1,
        count: 10,
        sorting: {
          expiration_date: 'asc'
        }
      };

      var resolver = {
        total: inventoryLines.length,
        getData: function ($defer, params) {
          var orderedData = params.sorting() ? $filter('orderBy')(inventoryLines, params.orderBy()) : inventoryLines;
          $defer.resolve(orderedData.slice(
              (params.page() - 1) * params.count(),
              params.page() * params.count()
          ));
        }
      }

      $scope.inventory = new ngTableParams(params, resolver);

      $scope.getTotalQuantity = function (inventoryLine) {
        //getTotalQuantity(inventoryLine)+' '+(((inventoryLine.batch).product).base_uom).symbol
        //var inventoryLineBatch = inventoryLine.batch;
        console.log(inventoryLine.batch.presentation);
        var totalQuantity = inventoryLine.quantity;
        return totalQuantity;
      };

      $scope.getProductTypeUOM = function (inventoryLine) {
        var inventoryLineBatch = inventoryLine.batch;
        var product = inventoryLineBatch.product;
        return product.base_uom;
      };

      $scope.getStorageVolume = function (inventoryLine) {
        var inventoryLineBatch = inventoryLine.batch;
        var storageVolume = inventoryLineBatch.packed_volume * inventoryLine.quantity;
        return storageVolume;
      }

    })
/**
 * addInventoryCtrl is the controller used to manually add bundles that don't exist already on the local storage
 * to the inventory upon arrival.
 */
    .controller('addInventoryCtrl', function ($scope, $filter, inventoryFactory, productTypes, programs, uomList,
                                              facilities, batchFactory, storageUnitFactory) {

      //used to hold form data
      $scope.inventory = {
        authorized: false,
        inventory_lines: [],
        date_receipt: $filter('date')(new Date(), 'yyyy-MM-dd'),
        bundle_no: ''
      }

      var id = 0;

      //load data used to populate form fields
      $scope.productTypes = productTypes;
      $scope.programs = programs;
      $scope.uomList = uomList;
      $scope.facilities = facilities;
      $scope.receivingFacilityStorageUnits = []


      $scope.loadProductTypeBatches = function (inventoryLine) {
        inventoryLine.isDisabled = false;
        batchFactory.getByProductType(inventoryLine.productType).then(function (data) {
          inventoryLine.productTypeBatches = data;
        });
      }

      $scope.updateBatchNo = function (inventoryLine) {
        batchFactory.get(inventoryLine.selectedBatch).then(function (data) {
          inventoryLine.batch_no = data.batch_no;
        });
      }

      $scope.loadReceivingFacilityStorageUnits = function (facilityUUID) {
        storageUnitFactory.getFacilityStorageUnits(facilityUUID).then(function (data) {
          $scope.receivingFacilityStorageUnits = data;
        });
      }

      $scope.addInventoryLine = function () {
        $scope.inventory.inventory_lines.push({
          id: id++,
          productTypes: productTypes,
          isDisabled: true
        });
      }

      $scope.removeInventoryLine = function (inventoryLine) {
        $scope.inventory.inventory_lines = $scope.inventory.inventory_lines.filter(function (il) {
          return il.id !== inventoryLine.id;
        });
      }

      $scope.save = function () {
        inventoryFactory.save($scope.inventory);
      }

    });



