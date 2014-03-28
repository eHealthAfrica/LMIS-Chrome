'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('stockCountIndex', {
        data:{
          label:'Stock Count'
        },
        url:'/stockCountIndex?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/index.html',
        controller:'StockCountCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.load();
          }
        }
      })
      .state('stockCountStepForm', {
        data:{
          label:'Stock Count Form'
        },
        url:'/stockCountStepForm?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/step_entry_form.html',
        controller: 'StockCountStepsFormCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.load();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
      .state('wasteCountForm', {
        data:{
          label:'Waste Count Form'
        },
        url: '/wasteCountForm?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/daily_waste_count_form.html',
        controller:'StockCountCtrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.load();
          }
        }
      })
      .state('syncStockCount', {
        abstract: true,
        templateUrl: 'views/stockcount/sync.html',
      })
      .state('syncStockCount.detail', {
        data: {
          label: 'Sync stock count'
        },
        url: '/sync-stock-count',
        views: {
          'stats': {
            templateUrl: 'views/stockcount/sync/stats.html',
            resolve: {
              stockCount: function(stockCountFactory) {
                return stockCountFactory.get.allStockCount();
              }
            },
            controller: function($log, $scope, $translate, config, pouchdb, stockCount, alertsFactory) {
              var dbName = 'stockcount',
                  db = pouchdb.create(dbName),
                  remote = config.apiBaseURI + '/' + dbName;

              // XXX: db#info returns incorrect doc_count, see item:333
              db.allDocs()
                .then(function(docs) {
                  // jshint camelcase: false
                  var info = {
                    doc_count: docs.total_rows
                  };
                  $scope.local = info;
                })
                .then(function() {
                  $scope.remoteSyncing = true;
                  var remoteDB = pouchdb.create(remote);
                  remoteDB.info()
                    .then(function(info) {
                      $scope.remote = info;
                      $scope.remoteSyncing = false;
                    });
                })
                .catch(function(reason) {
                  $log.error(reason);
                });

              $scope.sync = function() {
                $scope.syncing = true;
                var cb = {complete: function() {
                  $translate('syncSuccess')
                    .then(function(syncSuccess) {
                      alertsFactory.success(syncSuccess);
                    })
                    .catch(function(reason) {
                      $log.error(reason);
                    })
                    .finally(function() {
                      $scope.syncing = false;
                    });
                }};
                db.replicate.sync(remote, cb);
              };
            }
          },
          'status': {
            templateUrl: 'views/stockcount/sync/status.html'
          }
        }
      });
  })
/*
 * Base Controller
 */
  .controller('StockCountCtrl', function($scope, $stateParams, stockCountFactory, appConfig) {

    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    $scope.products = stockCountFactory.programProducts;
    // $scope.productType = productType;

    $scope.step = 0;
    $scope.maxStep =  $scope.products.length>0?$scope.products.length - 1: 0;
    $scope.monthList = stockCountFactory.monthList;

    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    stockCountFactory.get.userFacilities().then(function(data){
      $scope.userRelatedFacilities = data;
      if(data.length>0){
        $scope.facilityUuid = $scope.facilityUuid === ''?$scope.userRelatedFacilities[0].uuid:$scope.facilityUuid;
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
    };

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
  .controller('StockCountIndexCtrl', function ($scope, stockCountFactory) {
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
    $scope.subHeader = function (products){
      var subHeaderVar = '<td>Days</td>';

      for(var i=0; i<products.length; i++){
        subHeaderVar += '<td>Opened</td><td>Unopened</td>';
      }
      return subHeaderVar;
    };

    $scope.columnData =  stockCountFactory.get.stockCountColumnData;

    /*
     * load some none standard fixtures
     */
    /*var file_url = 'scripts/fixtures/userRelatedFacilities.json';
     $http.get(file_url).success(function (data) {
     $scope.userRelatedFacilities = data;

     });*/

    $scope.addButton = true;

    $scope.$watchCollection('[reportMonth, reportYear, userRelatedFacility]', function (newvalues) {

      if (newvalues[0] === '' || newvalues[1] === '' || newvalues[2] === '') {
        $scope.addButton = true;
      }
      else {
        $scope.addButton = false;
      }
      $scope.daysInMonth = $scope.getDaysInMonth($scope.reportMonth, $scope.reportYear);

    });

    $scope.$watch('userRelatedFacility', function () {
      if ($scope.userRelatedFacility !== '') {
        stockCountFactory.get.locations().then(function(data){
          for (var k in $scope.userRelatedFacilities) {
            if ($scope.userRelatedFacilities[k].uuid === $scope.userRelatedFacility) {
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
 * Wastage Count Controller
 */
  .controller('WasteCountFormCtrl', function($scope, stockCountFactory, $state){
    $scope.discardedReasons = stockCountFactory.discardedReasons;
    $scope.wastageCount = {};
    $scope.wastageCount.discarded = {};
    $scope.wastageCount.month = $scope.reportMonth;
    $scope.wastageCount.year = $scope.reportYear;
    $scope.wastageCount.facility = $scope.facilityUuid;
    $scope.wastageCount.wastageConfirmation = {};
    $scope.wastageCount.reason = {};
    $scope.wastageCount.day= $scope.currentDay;
    for(var i=0; i<$scope.products.length; i++){
      $scope.wastageCount.reason[i]={};
    }

    $scope.save = function(){
      stockCountFactory.save.wastage($scope.wastageCount)
        .then(function(){
          $state.go('stockCountIndex',
            {
              facility: $scope.facilityUuid,
              reportMonth: $scope.reportMonth,
              reportYear: $scope.reportYear
            });
        });
    };

  })
  .controller('StockCountStepsFormCtrl', function($scope, stockCountFactory, $state, alertsFactory, $stateParams, appConfig, productType, $log, $translate, pouchdb, config){
    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    $scope.productType = productType;

    $scope.step = 0;
    $scope.monthList = stockCountFactory.monthList;
    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();

    $scope.currentDay = day;

    $scope.preview = false;
    $scope.editOn = false;


    $scope.stockCount = {};
    $scope.stockCount.opened = {};
    $scope.stockCount.unopened = {};
    $scope.stockCount.confirmation = {};

    $scope.stockCount.countDate = '';
    $scope.alertMsg = 'stock count value is invalid, at least enter Zero "0" to proceed';
    $scope.facilityProducts = stockCountFactory.facilityProducts(); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }
    else{
      $scope.maxStep =0;
    }

    $scope.edit = function(index){
      $scope.step = index;
      $scope.productKey = $scope.facilityProductsKeys[$scope.step];
      $scope.preview = false;
      $scope.editOn = true;
    };

    $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
    $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    $scope.redirect = true; //initialize redirect as true
    $scope.stockCount.isComplete = 1; //and stock count entry as completed
    var timezone = stockCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.currentDay;
    stockCountFactory.getStockCountByDate(date).then(function(stockCount){
      if(stockCount !== null){
        $scope.stockCount = stockCount;
        $scope.editOn = true; // enable edit mode
      }
    });

    $scope.save = function(){
      var dbName = 'stockcount';
      $scope.stockCount.facility = $scope.facilityUuid;
      $scope.stockCount.countDate = new Date($scope.reportYear, parseInt($scope.reportMonth)-1, $scope.currentDay, timezone);

      stockCountFactory.save.stock($scope.stockCount)
        .then(function() {
          if($scope.redirect) {
            $translate('stockCountSaved')
              .then(function(stockCountSaved) {
                alertsFactory.success(stockCountSaved);
              })
              .then(function() {
                var db = pouchdb.create(name);
                var obj = $scope.stockCount;
                obj._id = obj.uuid;
                db.put(obj)
                  .then(function() {
                    var cb = {complete: function() {
                      $translate('syncSuccess')
                        .then(function(syncSuccess) {
                          alertsFactory.success(syncSuccess);
                        })
                        .then(function() {
                          if($scope.redirect) {
                            var msg = [
                              'You have completed stock count for',
                              $scope.currentDay,
                              $scope.monthList[$scope.reportMonth],
                              $scope.reportYear
                            ];
                            alertsFactory.success(msg.join(' '));
                            $state.go('home.index.mainActivity', {
                              'facility': $scope.facilityUuid,
                              'reportMonth': $scope.reportMonth,
                              'reportYear': $scope.reportYear,
                              'stockResult': msg
                            });
                          }
                        })
                        .catch(function(reason) {
                          $log.error(reason);
                        });
                    }};
                    var db = pouchdb.create(name);
                    db.replicate.to(config.apiBaseURI + '/' + dbName, cb);
                  })
                  .catch(function(reason) {
                    if(reason.message) {
                      alertsFactory.danger(reason.message);
                    }
                    $log.error(reason);
                  });
              });
          }
          $scope.redirect = true; // always reset to true after every save
          $scope.stockCount.isComplete = 1;
        });
    };

    $scope.changeState = function(direction){
      $scope.currentEntry = $scope.stockCount.unopened[$scope.facilityProductsKeys[$scope.step]];
      if(stockCountFactory.validate.invalid($scope.currentEntry) && direction !== 0){
        alertsFactory.danger($scope.alertMsg);
      }
      else{
        if(direction !== 2){
          $scope.step = direction === 0? $scope.step-1 : $scope.step + 1;
        }
        else{
          $scope.preview = true;
        }
        $scope.productKey = $scope.facilityProductsKeys[$scope.step];
        //TODO: this is best done with $timeout to auto save data when interface is idle for x mount of time
        $scope.redirect = false;// we don't need to redirect when this fn calls save()
        $scope.stockCount.isComplete = 0;// when saved from this fn its not complete yet
        $scope.save();
      }
      $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
      $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    };
  });
