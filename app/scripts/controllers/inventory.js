'use strict';
angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('inventoryListView', {
    url: '/inventory-list',
    templateUrl: '/views/inventory/index.html',
    controller: 'InventoryListCtrl',
    data: {
      label: "Inventory List"
    },
    resolve: {
      appConfig: function (appConfigService) {
        return appConfigService.load();
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
          appConfig: function (appConfigService) {
            return appConfigService.load();
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
    .controller('InventoryListCtrl', function ($rootScope, $stateParams, $scope, appConfig, inventoryFactory, $filter, ngTableParams, visualMarkerService) {

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;
      $scope.currentFacility = appConfig.appFacility;
      inventoryFactory.getFacilityInventory($scope.currentFacility.uuid).then(function (inventoryItems) {
        $scope.totalItems = inventoryItems.length;
        console.log('hey here -- ' + inventoryItems);

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
    }, function (error) {
      console.log(error);
    })
/**
 * addInventoryCtrl is the controller used to manually add bundles that don't exist already on the local storage
 * to the inventory upon arrival.
 */
    .controller('AddNewInventoryCtrl', function ($q, $scope, $filter, $stateParams, appConfig, storageService, $state, inventoryFactory, productTypes, programs, uomList, facilities, batchFactory, currentFacilityStorageUnits, i18n) {

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
      $scope.inventory.receiving_facility = appConfig.appFacility;
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

      $scope.createProgramObj = function (inventoryLine) {
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.programObj = JSON.parse(inventoryLine.program);
      };

      $scope.createUOMObj = function (inventoryLine) {
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.uomObj = JSON.parse(inventoryLine.uom);
      };

      $scope.createStorageUnitObj = function (inventoryLine) {
        //TODO: find better way to persist form input at preview page not uuid
        inventoryLine.storageUnitObj = JSON.parse(inventoryLine.storage_unit);
      };

      $scope.createSendingFacilityObj = function (inventory) {
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

        //TODO: remove this when saving form selections for preview has been resolved.
        $scope.inventory.sending_facility = $scope.inventory.sendingFacilityObj.uuid;
        for (var index in $scope.inventory.inventory_lines) {
          var inventoryLine = $scope.inventory.inventory_lines[index];
          inventoryLine.uom = inventoryLine.uomObj.uuid;
          inventoryLine.productType = inventoryLine.productTypeObj.uuid;
          inventoryLine.program = inventoryLine.programObj.uuid;
          inventoryLine.storage_unit = inventoryLine.storageUnitObj.uuid
        }

        inventoryFactory.save($scope.inventory).then(function (result) {
          console.log("add inventory result " + result.length);
          if (result.length !== 0) {
            //FIXME: This does not redirect to dashboard. 'home.index.dashboard
            $state.go('home.index.mainActivity', {
              logIncomingMsg: i18n('logIncomingSuccessMessage')
            });
          }
        });
      };

    });



