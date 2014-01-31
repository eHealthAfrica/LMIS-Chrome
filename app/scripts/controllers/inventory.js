'use strict';
var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('InventoryCtrl', function ($scope, $location, storageService) {
    $scope.facility_uuid = ($location.search()).facility;
    $scope.report_month = ($location.search()).report_month;
    $scope.report_year = ($location.search()).report_year;
    $scope.url_params = "?facility="+$scope.facility_uuid+"&report_month="+$scope.report_month+"&report_year="+$scope.report_year;
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

});

chromeApp.controller("StockRecordsCtrl", function ($scope, $location, storageService, $http, $filter) {


  $scope.user_related_facilities = [];
  $scope.fake_locations = [];
  $scope.user_related_facility = ($scope.facility_uuid != undefined) ? $scope.facility_uuid : '';
  $scope.report_month = ($scope.report_month != undefined) ? $scope.report_month : '';
  $scope.report_year = ($scope.report_year != undefined) ? $scope.report_year : '';
  $scope.monthly_stock_record_object = {};


  storageService.get('monthly_stock_record').then(function (data) {
    $scope.monthly_stock_record = data;
  });
  storageService.loadTableObject('monthly_stock_record').then(function (data) {
    $scope.monthly_stock_record_object = data;
  });


  var file_url = 'scripts/fixtures/user_related_facilities.json';
  $http.get(file_url).success(function (data) {
    $scope.user_related_facilities = data;

    var file_url = 'scripts/fixtures/user_related_facilities.json';
    $http.get(file_url).success(function(data){
        $scope.user_related_facilities =data;

  $scope.add_button = true;
  $scope.$watchCollection('[report_month, report_year, user_related_facility]', function (newvalues) {
    console.log(newvalues);
    $scope.record_key = $scope.user_related_facility + $scope.report_month + $scope.report_year;
    if (newvalues[0] == '' || newvalues[1] == '' || newvalues[2] == '') {
      $scope.add_button = true;
    }
    else {
      $scope.add_button = false;
    }

    $scope.add_button = true;
    $scope.$watchCollection('[report_month, report_year, user_related_facility]', function(newvalues){
        //console.log(newvalues);
        $scope.record_key = $scope.user_related_facility + $scope.report_month + $scope.report_year;

        storageService.get('monthly_stock_record').then(function(data){
            $scope.monthly_stock_record = data;
        });
        storageService.loadTableObject('monthly_stock_record').then(function(data){
            $scope.monthly_stock_record_object = data;
        });
        if(newvalues[0]=='' || newvalues[1] == '' || newvalues[2] == ''){
            $scope.add_button = true;
        }
        else{
            $scope.add_button = false;
        }


      });
    }

    $scope.$watch('user_related_facility',function(){
        if($scope.user_related_facility != ''){
            var file_url2 = 'scripts/fixtures/locations.json';
            $http.get(file_url2).success(function(data){
                for(var k in $scope.user_related_facilities){
                    if($scope.user_related_facilities[k].uuid == $scope.user_related_facility){
                        $scope.ward =data[$scope.user_related_facilities[k].location].name;
                        $scope.lga =data[$scope.user_related_facilities[k].location].lga;
                        $scope.state =data[$scope.user_related_facilities[k].location].state;
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

  $scope.loadProducts = function () {
    $scope.stock_records.products = $scope.stock_records.program;
  }
});

chromeApp.controller("StockRecordsFormCtrl", function ($scope, $location, storageService) {

  //$scope.facility_uuid = ($location.search()).facility;
  //$scope.report_month = ($location.search()).report_month;
  //$scope.report_year = ($location.search()).report_year;
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
      //$location.path("/inventory/stock_records_basic_form"+$scope.url_params);
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
  storageService.get(storageService.PROGRAM_PRODUCTS).then(function (data) {
    $scope.program_products = data;
  });
  $scope.saveStockReoprt = function () {

    storageService.insert('monthly_stock_record', {
      uuid: $scope.record_key,
      max_records: $scope.stock_records.maximum_stock,
      min_record: $scope.stock_records.minimum_stock,
      target_population: $scope.stock_records.target_population,
      balance_brought_forward: $scope.stock_records.balance_brought_forward
    }).then(function (bool) {
          console.log("saving");
          $location.path("/inventory/stock_records_form" + $scope.url_params);
        });

  }
});

chromeApp.controller("StockRecordsFormCtrl",function($scope, $location, storageService){

/**
 * Controller for showing inventory
 */
chromeApp.controller('inventoryMainCtrl', function ($scope, storageService, $filter, ngTableParams, utility,
                                                    visualMarkerService) {

    });
    var date_day = [];
    for(var i=1;i<32;i++){
        date_day.push(i);
    }
    $scope.date_var = date_day;
  $scope.highlight = visualMarkerService.markByExpirationStatus;

    $scope.stock_records = {};
    $scope.stock_records.received = [];
    $scope.stock_records.used = [];
    $scope.stock_records.balance = [];
    $scope.stock_records.expiry = [];
    $scope.stock_records.vvm = [];
    $scope.stock_records.breakage = [];
    $scope.stock_records.frozen = [];
    $scope.stock_records.label_removed = [];
    $scope.stock_records.others = [];
    $scope.stock_records.maximum_stock = [];
    $scope.stock_records.minimum_stock = [];
    $scope.stock_records.balance_brought_forward=[];
  storageService.get(storageService.INVENTORY).then(function (data) {

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

    $scope.inventory = new ngTableParams(params, resolver);

    storageService.loadTableObject(storageService.PRODUCT_ITEM).then(function (data) {
      $scope.product_item = data;
    });

    storageService.loadTableObject(storageService.PRODUCT).then(function (data) {
      $scope.products = data;
    });

    storageService.loadTableObject(storageService.PRODUCT_PRESENTATION).then(function (data) {
      $scope.presentation = data;
    });

    storageService.loadTableObject(storageService.STORAGE_LOCATION).then(function (data) {
      $scope.cceList = data;
    });

    storageService.loadTableObject(storageService.UOM).then(function (data) {
      $scope.uomList = data;
    });

        storageService.insert('monthly_stock_record',{
            uuid:$scope.record_key,
            max_records:$scope.stock_records.maximum_stock,
            min_record:$scope.stock_records.minimum_stock,
            target_population: $scope.stock_records.target_population,
            balance_brought_forward:$scope.stock_records.balance_brought_forward
        }).then(function(bool){
                //console.log("saving");
                //$location.path("/inventory/stock_records");
            });
  });


/**
 * Add to inventory controller
 */
chromeApp.controller('addInventoryCtrl', function ($scope, storageService, $location) {

  $scope.inventory = {}

  storageService.get(storageService.PRODUCT_ITEM).then(function (data) {
    $scope.productItems = data;
  });

  storageService.get(storageService.STORAGE_LOCATION).then(function (data) {
    $scope.cceList = data;
  });

  storageService.get(storageService.UOM).then(function (data) {
    $scope.uomList = data;
  });

  $scope.save = function () {
    storageService.insert(storageService.INVENTORY, $scope.inventory).then(function () {
      $location.path('/inventory/index');
    });
    console.log($scope.inventory);
  };

});


