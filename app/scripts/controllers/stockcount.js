'use strict';

angular.module('lmisChromeApp')
    .config(function($stateProvider) {
        $stateProvider
        .state('stockCountIndex', {
          data:{
              label:'Stock Count'
          },
          url:'stockCountIndex?facility&report_month&report_year',
          templateUrl: 'views/stockcount/index.html',
          controller:'StockCountCtrl'
        })

        .state('stockCountForm', {
          data:{
              label:'Stock Count Form'
          },
          url:'stockCountForm?facility&report_month&report_year',
          templateUrl: 'views/stockcount/daily_stock_count_form.html',
          controller: 'StockCountCtrl'
        })

        .state('wasteCountForm', {
          data:{
              label:'Waste Count Form'
          },
          url: 'wasteCountForm?facility&report_month&report_year',
          templateUrl: 'views/stockcount/daily_waste_count_form.html',
          controller:'StockCountCtrl'
        });
    })
/*
* Base Controller
 */
    .controller('StockCountCtrl', function($scope, $stateParams, stockCountFactory) {

        var now = new Date();
        var day = now.getDate();
        day = day < 10 ? '0' + day : day;

        $scope.stock_products = stockCountFactory.programProducts;

         /*
        * get url parameters
        */

        $scope.facility_uuid = ($stateParams.facility !== null)?$stateParams.facility:'';
        $scope.report_month = ($stateParams.report_month !== null)?$stateParams.report_month:'';
        $scope.report_year = ($stateParams.report_year !== null)?$stateParams.report_year: now.getFullYear();

        $scope.getDaysInMonth = function (report_month, report_year){

            var now = new Date();
            var year = (report_year !== '')?report_year: now.getFullYear();
            var month = (report_month !== '')?report_month: now.getMonth() + 1;
            var numberOfDays = new Date(year, month, 0).getDate();
            var dayArray = [];
            for(var i=0; i<numberOfDays; i++){
                dayArray.push(i+1);
            }
            return dayArray;
        }

        function yearRange(){
            var yearRangeArray = [];
            var currentYear = new Date().getFullYear();
            var rangeDiff = 3;
            for(var i=currentYear-rangeDiff; i<currentYear+1; i++){
                yearRangeArray.push(i);
            }
            return yearRangeArray;
        }

        $scope.current_day = day;
        $scope.daysInMonth = $scope.getDaysInMonth($scope.report_month, $scope.report_year);
        $scope.yearRange = yearRange();
    })
 /*
 * Landing page controller
  */
    .controller('StockCountIndexCtrl', function ($scope, $location, storageService, $http, stockCountFactory) {
      /*
       * initialize some variables
       */
      $scope.user_related_facilities = [];
      $scope.fake_locations = [];
      $scope.user_related_facility = ($scope.facility_uuid != null) ? $scope.facility_uuid : '';
      $scope.monthly_stock_record_object = {};
      $scope.StockCount = {};
      $scope.WasteCount = {};
      $scope.stockCountObject = {};


      stockCountFactory.get.allStockCount()
        .then(function(StockCount){
            $scope.StockCount = StockCount;
            $scope.stockCountObject = stockCountFactory.get.createStockObject(StockCount);
        });
      stockCountFactory.get.allWasteCount()
        .then(function(WasteCount){
            $scope.WasteCount = WasteCount;
        });
       $scope.subHeader = function (stock_products){
            var subHeaderVar = '<td>Days</td>';

               for(var i in stock_products){
                    subHeaderVar += '<td>Opened</td><td>Unopened</td>'
               }

            return subHeaderVar;
        }

        $scope.columnData =  stockCountFactory.get.stockCountColumnData;


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
        $scope.daysInMonth = $scope.getDaysInMonth($scope.report_month, $scope.report_year);

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
    /*
    * Stock Count Controller
    */
    .controller('StockCountFormCtrl', function($scope, stockCountFactory, $state){
        $scope.stockCount = {};
        $scope.stockCount.used_opened = {};
        $scope.stockCount.used_unopened = {};
        $scope.stockCount.confirmation = {};
        $scope.stockCount.facility = $scope.facility_uuid;
        $scope.stockCount.month = $scope.report_month;
        $scope.stockCount.year = $scope.report_year;
        $scope.stockCount.day = $scope.current_day;

        $scope.save = function(){
            stockCountFactory.save.stock($scope.stockCount)
                .then(function(uuid){
                    $state.go('stockCountIndex',
                        {
                            "facility": $scope.facility_uuid,
                            "report_month": $scope.report_month,
                            "report_year": $scope.report_year
                        });
                });
        }
    })
   /*
    * Wastage Count Controller
    */
    .controller('WasteCountFormCtrl', function($scope, stockCountFactory, $state){
        $scope.discardedReasons = stockCountFactory.discardedReasons;
        $scope.wastageCount = {};
        $scope.wastageCount.discarded = {};
        $scope.wastageCount.month = $scope.report_month;
        $scope.wastageCount.year = $scope.report_year;
        $scope.wastageCount.facility = $scope.facility_uuid;
        $scope.wastageCount.wastage_confirmation = {};
        $scope.wastageCount.reason = {};
        $scope.wastageCount.day= $scope.current_day;
        for(var i=0; i<$scope.stock_products.length; i++){
            $scope.wastageCount.reason[i]={};
        }




        $scope.save = function(){
            stockCountFactory.save.wastage($scope.wastageCount)
                .then(function(uuid){
                     $state.go('stockCountIndex',
                        {
                            "facility": $scope.facility_uuid,
                            "report_month": $scope.report_month,
                            "report_year": $scope.report_year
                        });
                });
        }

    });
