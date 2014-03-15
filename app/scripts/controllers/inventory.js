'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('inventoryListView', {
    url: '/inventory-list',
    templateUrl: '/views/inventory/index.html',
    controller: 'inventoryListCtrl',
    data: {
      label: "Inventory List"
    },
    resolve: {
      currentFacility: function (facilityFactory) {
        return facilityFactory.getCurrentFacility();
      }
    }
  })
  .state('addNewInventory', {
    url: '/add-inventory?bundleNo',
    templateUrl: '/views/inventory/add-inventory.html',
    controller: 'AddNewInventoryCtrl',
    data: {
      label: "Add New Inventory"
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
      },
      currentFacility: function (facilityFactory) {
        return facilityFactory.getCurrentFacility();
      },
      currentFacilityStorageUnits: function (storageUnitFactory) {
        return storageUnitFactory.getStorageUnitsByCurrentFacility();
      }
    }
  });
})
/**
 * Controller for showing inventory
 */
    .controller('inventoryListCtrl', function ($rootScope, $stateParams, $scope, currentFacility, inventoryFactory,
                                               $filter, ngTableParams, visualMarkerService) {

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;
      $scope.currentFacility = currentFacility;
      inventoryFactory.getAll(currentFacility.uuid).then(function (inventoryItems) {
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
        var product = $scope.getProductType(inventoryLine)
        return product.base_uom;
      };

      $scope.getBatch = function (inventoryLine) {
        return (toString.call(inventoryLine.batch) === '[object Object]') ?
            inventoryLine.batch.batch_no : inventoryLine.batch;
      }

      $scope.getProductType = function (inventoryLine) {
        return (toString.call(inventoryLine.batch) === '[object Object]')
            ? inventoryLine.batch.product : inventoryLine.product_type;
      }
    })
/**
 * addInventoryCtrl is the controller used to manually add bundles that don't exist already on the local storage
 * to the inventory upon arrival.
 */
    .controller('AddNewInventoryCtrl', function ($q, $scope, $filter, $stateParams, currentFacility, storageService, $state,
                                              inventoryFactory, productTypes, programs, uomList, facilities, batchFactory,
                                              currentFacilityStorageUnits) {

      //used to hold form data
      var id = 0;

      $scope.inventory = {
        showForm: true,
        authorized: false,
        inventory_lines: [],
        date_receipt: $filter('date')(new Date(), 'yyyy-MM-dd'),
        bundle_no: $stateParams.bundleNo
      };

      //load data used to populate form fields
      $scope.productTypes = productTypes;
      $scope.programs = programs;
      $scope.uomList = uomList;
      $scope.facilities = facilities;
      $scope.inventory.receiving_facility = currentFacility;
      $scope.receivingFacilityStorageUnits = currentFacilityStorageUnits;

      $scope.loadProductTypeBatches = function (inventoryLine) {
        inventoryLine.isDisabled = false;
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.productTypeObj = JSON.parse(inventoryLine.productType);
        batchFactory.getByProductType(inventoryLine.productTypeObj.uuid).then(function (data) {
          inventoryLine.productTypeBatches = data;
          if (inventoryLine.productTypeBatches.length === 0) {
            inventoryLine.batch_no = '';
          }
        });
      };

      $scope.createProgramObj = function(inventoryLine){
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.programObj = JSON.parse(inventoryLine.program);
      };

      $scope.createUOMObj = function(inventoryLine){
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.uomObj = JSON.parse(inventoryLine.uom);
      };

      $scope.createStorageUnitObj = function(inventoryLine){
        //TODO: find better way to persist form input at preview page not uuid
       inventoryLine.storageUnitObj = JSON.parse(inventoryLine.storage_unit);
      };

      $scope.createSendingFacilityObj = function(inventory){
        inventory.sendingFacilityObj = JSON.parse(inventory.sending_facility);
      };

      $scope.updateBatchNo = function (inventoryLine) {
        batchFactory.get(inventoryLine.selectedBatch).then(function (data) {
          inventoryLine.batch_no = data.batch_no;
        });
      };

      $scope.addInventoryLine = function () {
        $scope.inventory.inventory_lines.push({
          id: id++,
          productTypes: productTypes,
          isDisabled: true
        });
      };

      $scope.removeInventoryLine = function (inventoryLine) {
        $scope.inventory.inventory_lines = $scope.inventory.inventory_lines.filter(function (invLine) {
          return invLine.id !== inventoryLine.id;
        });
      };

      $scope.confirm = function () {

        console.log($scope.inventory);

        return;

        //TODO: remove this when saving form selections for preview has been resolved.
        $scope.inventory.sending_facility = $scope.inventory.sendingFacilityObj.uuid;
        for(var index in $scope.inventory.inventory_lines){
          var inventoryLine = $scope.inventory.inventory_lines[index];
          inventoryLine.uom = inventoryLine.uomObj.uuid;
          inventoryLine.productType = inventoryLine.productTypeObj.uuid;
          inventoryLine.program = inventoryLine.programObj.uuid;
          inventoryLine.storage_unit = inventoryLine.storageUnitObj.uuid
        }

        console.log($scope.inventory);

        inventoryFactory.save($scope.inventory).then(function (result) {
          if (result.length !== 0) {
            $state.go('home.index.dashboard', {logSucceeded: true});
          }
        });
      };

    });



