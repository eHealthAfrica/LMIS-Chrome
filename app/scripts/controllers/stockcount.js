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
      .state('stockCountStepForm', {
        data:{
          label:'Stock Count Form'
        },
        url:'stockCountStepForm?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/stock_steps.html',
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
    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    $scope.stockProducts = stockCountFactory.programProducts;

    $scope.step = 0;
    $scope.maxStep =  $scope.stockProducts.length>0?$scope.stockProducts.length - 1: 0;

    /*
     * get url parameters
     */
    $scope.monthList = stockCountFactory.monthList;
    $scope.facilityObject = currentFacility;
    console.log($scope.facilityObject.uuid);
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    stockCountFactory.get.userFacilities().then(function(data){
      $scope.userRelatedFacilities = data;
      if(data.length>0){
        $scope.facilityUuid = $scope.facilityUuid===''?$scope.userRelatedFacilities[0].uuid:$scope.facilityUuid;
        $scope.userRelatedFacility =  $scope.facilityUuid;
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

    $scope.currentDay = day;
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

    //$scope.userRelatedFacility = ($scope.facilityUuid !== '') ? $scope.facilityUuid : $scope.facilityUuid;
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
    $scope.subHeader = function (stockProducts){
      var subHeaderVar = '<td>Days</td>';

      for(var i in stockProducts){
        subHeaderVar += '<td>Opened</td><td>Unopened</td>'
      }

      return subHeaderVar;
    }

    $scope.columnData =  stockCountFactory.get.stockCountColumnData;

    /*
     * load some none standard fixtures
     */
    /*var file_url = 'scripts/fixtures/userRelatedFacilities.json';
     $http.get(file_url).success(function (data) {
     $scope.userRelatedFacilities = data;

     });*/

    $scope.add_button = true;

    $scope.$watchCollection('[reportMonth, reportYear, userRelatedFacility]', function (newvalues) {

      if (newvalues[0] === '' || newvalues[1] === '' || newvalues[2] === '') {
        $scope.add_button = true;
      }
      else {
        $scope.add_button = false;
      }
      $scope.daysInMonth = $scope.getDaysInMonth($scope.reportMonth, $scope.reportYear);

    });

    $scope.$watch('userRelatedFacility', function () {
      if ($scope.userRelatedFacility != '') {
        stockCountFactory.get.locations().then(function(data){
          for (var k in $scope.userRelatedFacilities) {
            if ($scope.userRelatedFacilities[k].uuid == $scope.userRelatedFacility) {
              $scope.ward = data[$scope.userRelatedFacilities[k].location].name;
              $scope.lga = data[$scope.userRelatedFacilities[k].location].lga;
              $scope.state = data[$scope.userRelatedFacilities[k].location].state;
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

    $scope.stockCount = {};
    $scope.stockCount.used_opened = {};
    $scope.stockCount.used_unopened = {};
    $scope.stockCount.confirmation = {};

    $scope.stockCount.month = $scope.reportMonth;
    $scope.stockCount.year = $scope.reportYear;
    $scope.stockCount.day = $scope.currentDay;

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
    $scope.wastageCount.day= $scope.currentDay;
    for(var i=0; i<$scope.stockProducts.length; i++){
      $scope.wastageCount.reason[i]={};
    }

    $scope.save = function(){
      stockCountFactory.save.wastage($scope.wastageCount)
        .then(function(uuid){
          $state.go('stockCountIndex',
            {
              'facility': $scope.facilityUuid,
              'reportMonth': $scope.reportMonth,
              'reportYear': $scope.reportYear
            });
        });
    }

  })
  .controller('StockCountStepsFormCtrl', function($scope,stockCountFactory, $state){
    $scope.preview = false;
    $scope.selectedProduct = '';
    $scope.jumpTo = function(){
      $scope.step = parseInt($scope.selectedProduct);
      $scope.preview = false;
    }

    $scope.edit = function(index){
      $scope.step = index;
      $scope.preview = false;
    }

    $scope.showDay = false;
    $scope.hideSelect = function(){
      $scope.showDay = false;
    }

    $scope.stockCount = {};
    $scope.stockCount.used_opened = {};
    $scope.stockCount.used_unopened = {};
    $scope.stockCount.confirmation = {};

    $scope.stockCount.month = $scope.reportMonth;
    $scope.stockCount.year = $scope.reportYear;
    $scope.stockCount.day = $scope.currentDay;

    $scope.save = function(){
      $scope.stockCount.facility = $scope.facilityUuid;
      stockCountFactory.save.stock($scope.stockCount)
        .then(function(uuid){
          $state.go('stockCountIndex',
            {
              'facility': $scope.facilityUuid,
              'reportMonth': $scope.reportMonth,
              'reportYear': $scope.reportYear
            });
        });
    }
  });
