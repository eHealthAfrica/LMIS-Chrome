'use strict';
angular.module('lmisChromeApp') .config(function($stateProvider) {
    $stateProvider
    .state('stock_count', {
      templateUrl: 'views/inventory/stock_records.html',
          controller: "InventoryCtrl"

    });
  })

    .controller('InventoryCtrl', function ($scope, $location, storageService, inventoryFactory) {

      $scope.stock_factory = inventoryFactory.stock_records;
      /*
       * get url parameters
       */
      $scope.facility_uuid = ($location.search()).facility;
      $scope.report_month = ($location.search()).report_month;
      $scope.report_year = ($location.search()).report_year;
      $scope.url_params = "?facility=" + $scope.facility_uuid + "&report_month=" + $scope.report_month + "&report_year=" + $scope.report_year;

      var now = new Date();
      var day = now.getDate();
      day = day < 10 ? '0' + day : day;
      $scope.current_day = day;


      $scope.stock_products =
          [
            'BCG doses',
            'BCG Diluent',
            'Hep.B doses',
            'OPV doses',
            'PENTA doses',
            'PCV doses',
            'Measles doses',
            'Measles Diluent',
            'Yellow Fever doses',
            'Yellow Fever Diluent',
            'CSM doses',
            'CSM Diluent',
            'Tetanus Toxoid doses',
            'BCG Syringes',
            'Auto Disable Syringes',
            '5mls Syringes',
            'Safety boxes'
          ]

    })

    .controller("StockRecordsCtrl", function ($scope, $location, storageService, $http) {
      /*
       * initialize some variables
       */
      $scope.user_related_facilities = [];
      $scope.fake_locations = [];
      $scope.user_related_facility = ($scope.facility_uuid != undefined) ? $scope.facility_uuid : '';
      $scope.report_month = ($scope.report_month != undefined) ? $scope.report_month : '';
      $scope.report_year = ($scope.report_year != undefined) ? $scope.report_year : '';
      $scope.monthly_stock_record_object = {};

      /*
       * get monthly stock records if any
       */
      storageService.get('monthly_stock_record').then(function (data) {
        $scope.monthly_stock_record = data;
      });
      /*
       * create an object of stock record using uuid as key for easy access
       */
      storageService.loadTableObject('monthly_stock_record').then(function (data) {
        $scope.monthly_stock_record_object = data;
      });

      /*
       * load some none standard fixtures
       */
      var file_url = 'scripts/fixtures/user_related_facilities.json';
      $http.get(file_url).success(function (data) {
        $scope.user_related_facilities = data;

      });


      $scope.brought_forward_columns = $scope.stock_factory.brought_forward_columns;
      $scope.table_column = $scope.stock_factory.status_column($scope.stock_products);
      $scope.add_button = true;

      $scope.$watchCollection('[report_month, report_year, user_related_facility]', function (newvalues) {

        $scope.record_key = $scope.user_related_facility + $scope.report_month + $scope.report_year;

        storageService.get('monthly_stock_record').then(function (data) {
          $scope.monthly_stock_record = data;
        });
        storageService.loadTableObject('monthly_stock_record').then(function (data) {
          $scope.monthly_stock_record_object = data;
        });
        if (newvalues[0] == '' || newvalues[1] == '' || newvalues[2] == '') {
          $scope.add_button = true;
        }
        else {
          $scope.add_button = false;
        }
      });


      $scope.$watch('user_related_facility', function () {
        if ($scope.user_related_facility != '') {
          var file_url2 = 'scripts/fixtures/locations.json';
          $http.get(file_url2).success(function (data) {
            for (var k in $scope.user_related_facilities) {
              if ($scope.user_related_facilities[k].uuid == $scope.user_related_facility) {
                $scope.ward = data[$scope.user_related_facilities[k].location].name;
                $scope.lga = data[$scope.user_related_facilities[k].location].lga;
                $scope.state = data[$scope.user_related_facilities[k].location].state;
                break;
              }
            }
          });
        }
      });


      $scope.stock_records = {};
      storageService.get('facility').then(function (data) {
        $scope.facilities = data;
      });
      storageService.get('programs').then(function (data) {
        $scope.programs = data;
      });

    })

    .controller("StockRecordsFormCtrl", function ($scope, $location, storageService, inventoryFactory) {


      $scope.record_key = $scope.facility_uuid + $scope.report_month + $scope.report_year;
      storageService.get('monthly_stock_record').then(function (data) {
        if (Object.prototype.toString.call(data) == '[object Array]') {
          if (data.length > 0) {
            storageService.loadTableObject('monthly_stock_record').then(function (data) {
              $scope.report_available = Object.keys(data).indexOf($scope.record_key) == -1 ? false : true;
            });
          }
          else {
            $scope.report_available = false;
          }
        }
        else if (Object.keys(data).length > 0) {
          $scope.report_available = Object.keys(data).indexOf($scope.record_key) == -1 ? false : true;
        }
        else {
          $scope.report_available = false;
        }

      });

      $scope.stock_records = {};
      $scope.stock_records.received = {};
      $scope.stock_records.used = {};
      $scope.stock_records.balance = {};
      $scope.stock_records.expiry = {};
      $scope.stock_records.vvm = {};
      $scope.stock_records.breakage = {};
      $scope.stock_records.frozen = {};
      $scope.stock_records.label_removed = {};
      $scope.stock_records.others = {};
      $scope.stock_records.maximum_stock = [];
      $scope.stock_records.minimum_stock = [];
      $scope.stock_records.balance_brought_forward = [];


      var date_day = [];
      for (var i = 1; i < 32; i++) {
        date_day.push(i);
      }
      $scope.date_var = date_day;


      $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      $scope.facility_programs =
      {
        "902aef31-051d-4a83-9017-6ac9710b5bb5": {
          program: "39a07d76-9d4b-4c9e-b50b-bba827d08f74"
        },
        "d48a39fb-6d37-4472-9983-bc0720403719": {
          program: "edc769e2-b26e-40e0-9b58-b59785cf50f7"
        }
      }

      $scope.stock_records.program = $scope.facility_programs[$scope.facility_uuid].program;

      storageService.get(storageService.PROGRAM_PRODUCTS).then(function (programProducts) {
        $scope.programProductList = programProducts;
      });
      storageService.loadTableObject(storageService.PROGRAM).then(function (programs) {
        $scope.programs_object = programs;
      });
      storageService.loadTableObject(storageService.PRODUCT).then(function (products) {
        $scope.products_object = products;
      });
      storageService.get('facility').then(function (data) {
        $scope.facilities = data;
      });
      storageService.get('programs').then(function (data) {
        $scope.programs = data;
      });
      //get program products
      storageService.get(storageService.PROGRAM_PRODUCTS).then(function (data) {
        $scope.program_products = data;
      });

      /**
       *  logic for saving stock record profile (records enterd once a month)
       *  afer saving, current page reloads.
       */
      $scope.saveStockReport = function () {
        var profile_object = {
          uuid: $scope.record_key,
          max_records: $scope.stock_records.maximum_stock,
          min_record: $scope.stock_records.minimum_stock,
          target_population: $scope.stock_records.target_population,
          balance_brought_forward: $scope.stock_records.balance_brought_forward
        }
        $scope.stock_factory.save_record_profile(profile_object);
      }
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

      $scope.highlight = visualMarkerService.markByExpirationStatus;

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

    })
/**
 * This Controller is used to add a bundle upon arrival to receiving facility inventory.
 */
    .controller('logIncomingBundleCtrl', function ($scope, storageService, bundleFactory) {
      $scope.showBundleNo = '';
      $scope.bundleReceipt = {};
      $scope.show = false;
      $scope.found = false;
      $scope.clicked = false;
      $scope.bundleLines = [];


      storageService.get(storageService.FACILITY).then(function(data){
       $scope.facilities = data;
      });

      storageService.get(storageService.USER).then(function(data){
       $scope.users = data;
      });




      storageService.get(storageService.BATCH).then(function(data){
        $scope.batches = data;
      });

      storageService.get(storageService.PRODUCT_TYPES).then(function(data){
        $scope.productTypes = data;
      });

      storageService.get(storageService.PROGRAM).then(function(data){
        $scope.programs = data;
      });

      storageService.get(storageService.UOM).then(function(data){
        $scope.uomList = data;
      });

      $scope.showBundle = function () {
        $scope.clicked = true;

        $scope.bundle = false;
        storageService.find(storageService.BUNDLE, $scope.showBundleNo).then(function (data) {
          if (data !== undefined) {
             $scope.bundle = data;
            $scope.bundleNo = $scope.bundle.uuid;

            $scope.bundleLines = bundleFactory.getBundleLines($scope.bundleNo);
            console.log($scope.bundleLines);

            $scope.receiving_facility = $scope.facilities[$scope.bundle.receiving_facility].name;
            $scope.parent = $scope.facilities[$scope.bundle.parent].name;
            $scope.order = $scope.bundle.order;
            $scope.user = $scope.users[$scope.bundle.user].username;
            $scope.show = true;
            $scope.found = true;

            return;
          }
          $scope.found = false;
        });
      };

      $scope.hideBundle = function(){
        $scope.found = false;
        $scope.clicked = false;
        $scope.show = false;
      }

    });


