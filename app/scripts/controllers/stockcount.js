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
        controller:'StockCountCtrl',
        resolve:{
          currentFacility: function(facilityFactory){
            return facilityFactory.getCurrentFacility();
          }
        }
      })
      .state('stockCountForm', {
        data:{
          label:'Stock Count Form'
        },
        url:'stockCountForm?facility&report_month&report_year',
        templateUrl: 'views/stockcount/daily_stock_count_form.html',
        controller: 'StockCountCtrl',
        resolve:{
          currentFacility: function(facilityFactory){
            return facilityFactory.getCurrentFacility();
          }
        }
      })
      .state('wasteCountForm', {
        data:{
          label:'Waste Count Form'
        },
        url: 'wasteCountForm?facility&report_month&report_year',
        templateUrl: 'views/stockcount/daily_waste_count_form.html',
        controller:'StockCountCtrl',
        resolve: {
          currentFacility: function(facilityFactory){
            return facilityFactory.getCurrentFacility();
          }
        }
      });
  })
/*
 * Base Controller
 */
  .controller('StockCountCtrl', function($scope, $stateParams, stockCountFactory, currentFacility) {

    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    $scope.stock_products = stockCountFactory.programProducts;

    /*
     * get url parameters
     */
    $scope.facility_object = currentFacility;
    console.log($scope.facility_object.uuid);
    $scope.facility_uuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facility_object.uuid;
    $scope.report_month = ($stateParams.report_month !== null)?$stateParams.report_month:now.getMonth() + 1;
    $scope.report_year = ($stateParams.report_year !== null)?$stateParams.report_year: now.getFullYear();
    stockCountFactory.get.userFacilities().then(function(data){
      $scope.user_related_facilities = data;
      if(data.length>0){
        $scope.facility_uuid = $scope.facility_uuid===''?$scope.user_related_facilities[0].uuid:$scope.facility_uuid;
        $scope.user_related_facility =  $scope.facility_uuid;
      }
    });

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
  .controller('StockCountIndexCtrl', function ($scope, $http, stockCountFactory) {
    /*
     * initialize some variables
     */
    //$scope.user_related_facility = ($scope.facility_uuid !== '') ? $scope.facility_uuid : $scope.facility_uuid;
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
     * load some none standard fixtures
     */
    /*var file_url = 'scripts/fixtures/user_related_facilities.json';
     $http.get(file_url).success(function (data) {
     $scope.user_related_facilities = data;

     });*/

    $scope.add_button = true;

    $scope.$watchCollection('[report_month, report_year, user_related_facility]', function (newvalues) {

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
        stockCountFactory.get.locations().then(function(data){
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
  })
/*
 * Stock Count Controller
 */
  .controller('StockCountFormCtrl', function($scope, stockCountFactory, $state, $stateParams){
    if($scope.facility_uuid === ''){
      $scope.hidden_uuid = true;
    }
    $scope.stockCount = {};
    $scope.stockCount.opened = {};
    $scope.stockCount.unopened = {};
    $scope.stockCount.confirmation = {};
    $scope.stockCount.month = $scope.report_month;
    $scope.stockCount.year = $scope.report_year;
    $scope.stockCount.day = $scope.current_day;

    $scope.save = function(){
      $scope.stockCount.facility = $scope.facility_uuid;
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
