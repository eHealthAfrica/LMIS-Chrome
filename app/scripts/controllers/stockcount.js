'use strict';

angular.module('lmisChromeApp')
    .config(function($stateProvider) {
        $stateProvider
        .state('stock_count_index', {
          url:'stock_count_index?facility&report_month&report_year',
          templateUrl: 'views/stockcount/index.html',
          controller:'StockCountCtrl'
        })
        .state('stock_count_form', {
          url:'stock_count_form?facility&report_month&report_year',
          templateUrl: 'views/stockcount/daily_stock_count_form.html',
          controller: 'StockCountCtrl'
        })
        .state('waste_count_form', {
          templateUrl: 'views/stockcount/daily_waste_count_form.html',
          controller:'StockCountCtrl'
        });
    })
    .controller('StockCountCtrl', function($scope, $location, storageService, inventoryFactory, $stateParams) {

          $scope.stock_factory = inventoryFactory.stock_records;
          /*
           * get url parameters
           */

          $scope.facility_uuid = $stateParams.facility;
          $scope.report_month = $stateParams.report_month;
          $scope.report_year = $stateParams.report_year;
          $scope.url_params = $stateParams;

          var now = new Date();
          var day = now.getDate();
          day = day < 10 ? '0' + day : day;
          $scope.current_day = day;
        $scope.stock_products = inventoryFactory.stock_records.program_products;

    })
    .controller('StockCountIndexCtrl', function ($scope, $location, storageService, $http, inventoryFactory) {
      /*
       * initialize some variables
       */
      $scope.user_related_facilities = [];
      $scope.fake_locations = [];
      $scope.user_related_facility = ($scope.facility_uuid != null) ? $scope.facility_uuid : '';
      $scope.report_month = ($scope.report_month != undefined) ? $scope.report_month : '';
      $scope.report_year = ($scope.report_year != undefined) ? $scope.report_year : '';
      $scope.monthly_stock_record_object = {};

      /*
       * get monthly stock records if any
       */
      storageService.all('monthly_stock_record').then(function (data) {
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

        storageService.all('monthly_stock_record').then(function (data) {
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
      storageService.all('facility').then(function (data) {
        $scope.facilities = data;
      });
      storageService.all('programs').then(function (data) {
        $scope.programs = data;
      });

     })
    .controller('StockCountFormCtrl', function($scope, inventoryFactory){
        $scope.stock_count = {};
        $scope.stock_count.used_opened = [];
        $scope.stock_count.used_unopened = [];
        $scope.stock_count.confirmation = [];
    })
    .controller('WasteCountFormCtrl', function($scope){
        $scope.stock_count = {};
        $scope.stock_count.used_opened = [];
        $scope.stock_count.used_unopened = [];
        $scope.stock_count.confirmation = [];

    });
$('.dropdown-btn').on('hide.bs.dropdown', function () {
    return false;
});