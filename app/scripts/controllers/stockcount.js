'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('stockCountIndex', {
        data:{
          label:'Stock Count'
        },
        url:'stockCountIndex?facility&reportMonth&reportYear',
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
        url:'stockCountForm?facility&reportMonth&reportYear',
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
        url: 'wasteCountForm?facility&reportMonth&reportYear',
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
    $scope.facilityObject = currentFacility;
    console.log($scope.facilityObject.uuid);
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:now.getMonth() + 1;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    stockCountFactory.get.userFacilities().then(function(data){
      $scope.user_related_facilities = data;
      if(data.length>0){
        $scope.facilityUuid = $scope.facilityUuid===''?$scope.user_related_facilities[0].uuid:$scope.facilityUuid;
        $scope.user_related_facility =  $scope.facilityUuid;
      }
    });

    $scope.getDaysInMonth = function (reportMonth, reportYear){

      var now = new Date();
      var year = (reportYear !== '')?reportYear: now.getFullYear();
      var month = (reportMonth !== '')?reportMonth: now.getMonth() + 1;
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
    $scope.daysInMonth = $scope.getDaysInMonth($scope.reportMonth, $scope.reportYear);
    $scope.yearRange = yearRange();
  })
/*
 * Landing page controller
 */
  .controller('StockCountIndexCtrl', function ($scope, $http, stockCountFactory) {
    /*
     * initialize some variables
     */
    //$scope.user_related_facility = ($scope.facilityUuid !== '') ? $scope.facilityUuid : $scope.facilityUuid;
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

    $scope.$watchCollection('[reportMonth, reportYear, user_related_facility]', function (newvalues) {

      if (newvalues[0] == '' || newvalues[1] == '' || newvalues[2] == '') {
        $scope.add_button = true;
      }
      else {
        $scope.add_button = false;
      }
      $scope.daysInMonth = $scope.getDaysInMonth($scope.reportMonth, $scope.reportYear);

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
  .controller('StockCountFormCtrl', function($scope, stockCountFactory, $state){
    if($scope.facilityUuid === ''){
      $scope.hidden_uuid = true;
    }
    $scope.stockCount = {};
    $scope.stockCount.opened = {};
    $scope.stockCount.unopened = {};
    $scope.stockCount.confirmation = {};
    $scope.stockCount.month = $scope.reportMonth;
    $scope.stockCount.year = $scope.reportYear;
    $scope.stockCount.day = $scope.current_day;

    $scope.save = function(){
      $scope.stockCount.facility = $scope.facilityUuid;
      stockCountFactory.save.stock($scope.stockCount)
        .then(function(uuid){
          $state.go('stockCountIndex',
            {
              "facility": $scope.facilityUuid,
              "reportMonth": $scope.reportMonth,
              "reportYear": $scope.reportYear
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
    $scope.wastageCount.month = $scope.reportMonth;
    $scope.wastageCount.year = $scope.reportYear;
    $scope.wastageCount.facility = $scope.facilityUuid;
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
              "facility": $scope.facilityUuid,
              "reportMonth": $scope.reportMonth,
              "reportYear": $scope.reportYear
            });
        });
    }

  });
