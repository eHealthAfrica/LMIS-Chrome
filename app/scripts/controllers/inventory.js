'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
      .state('inventoryListView', {
        url: '/inventory-list?add',
        templateUrl: '/views/inventory/index.html',
        controller: 'inventoryMainCtrl',
        data: {
          label: "Inventory List"
        },
        resolve: {
          currentFacility: function(facilityFactory){
            return facilityFactory.getCurrentFacility();
          }
        }
      }).state('addInventory', {
        url: '/add-inventory?bundleNo',
        templateUrl: '/views/inventory/add-inventory.html',
        controller: 'addInventoryCtrl',
        data: {
          label: "Add Inventory"
        },
        resolve: {
          productTypes: function (productTypeFactory) {
            return productTypeFactory.getFacilityInventory();
          },
          programs: function (programsFactory) {
            return programsFactory.getFacilityInventory();
          },
          uomList: function (uomFactory) {
            return uomFactory.getFacilityInventory();
          },
          facilities: function (facilityFactory) {
            return facilityFactory.getFacilityInventory();
          },
          currentFacility: function(facilityFactory){
            return facilityFactory.getCurrentFacility();
          }
        }
      });
})
/**
 * Controller for showing inventory
 */
    .controller('inventoryMainCtrl', function ($rootScope, $stateParams, $scope, currentFacility, inventoryFactory, $filter, ngTableParams, visualMarkerService, $translate, alertsFactory) {

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;

      if ($stateParams.add === "true") {
        $stateParams.add = '';
        $translate('addInventorySuccessMessage')
            .then(function (msg) {
              alertsFactory.add({message: msg, type: 'success'});
            });
      }

      $scope.currentFacility = currentFacility;

      inventoryFactory.getFacilityInventory(currentFacility.uuid).then(function (inventoryItems) {

        $scope.totalItems = inventoryItems.length;

        // Table defaults
        var params = {
          page: 1,
          count: 10,
          sorting: {
            expiration_date: 'asc'
          }
        };

        var resolver = {
          total: inventoryItems.length,
          getData: function ($defer, params) {
            var orderedData = params.sorting() ? $filter('orderBy')(inventoryItems, params.orderBy()) : inventoryItems;
            $defer.resolve(orderedData.slice(
                (params.page() - 1) * params.count(),
                params.page() * params.count()
            ));
          }
        }

        $scope.inventory = new ngTableParams(params, resolver);

      });


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
    .controller('addInventoryCtrl', function ($scope, $filter, $stateParams, currentFacility, storageService, $state,
                                              inventoryFactory, productTypes, programs, uomList, facilities, batchFactory, storageUnitFactory) {

      //used to hold form data
      $scope.inventory = {
        authorized: false,
        inventory_lines: [],
        date_receipt: $filter('date')(new Date(), 'yyyy-MM-dd'),
        bundle_no: $stateParams.bundleNo
      }

      var id = 0;

      //load data used to populate form fields
      $scope.productTypes = productTypes;
      $scope.programs = programs;
      $scope.uomList = uomList;
      $scope.facilities = facilities;
      $scope.inventory.receiving_facility =  currentFacility;
      $scope.receivingFacilityStorageUnits = []

      function loadCurrentFacilityStorageUnits(facilityUUID) {
        storageUnitFactory.getFacilityStorageUnits(facilityUUID).then(function (data) {
          $scope.receivingFacilityStorageUnits = data;
        });
      }

      loadCurrentFacilityStorageUnits($scope.inventory.receiving_facility.uuid);

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
        inventoryFactory.save($scope.inventory).then(function (result) {
          if (result.length !== 0) {
            $state.go('inventoryListView', {add: true});
          }
        });
      }

    });



