'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('stockCountHome', {
        parent: 'root.index',
        url: '/stockCountHome',
        data: {
          label: 'Stock Count Home'
        },
        templateUrl: 'views/stockcount/index.html',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          stockCountByDate: function(stockCountFactory){
            return stockCountFactory.get.stockCountListByDate();
          },
          productProfiles: function(stockCountFactory){
            return stockCountFactory.get.productProfile();
          }
        },
        controller: 'StockCountHomeCtrl'
      })
      .state('stockCountForm', {
        parent: 'root.index',
        data:{
          label:'Stock Count Form'
        },
        url:'/stockCountForm?facility&reportMonth&reportYear&reportDay&countDate&productKey',
        templateUrl: 'views/stockcount/stock-count-form.html',
        controller: 'StockCountFormCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
      .state('syncStockCount', {
        parent: 'root.index',
        abstract: true,
        templateUrl: 'views/stockcount/sync.html'
      });
  })
  .controller('StockCountHomeCtrl', function($scope, stockCountFactory, stockCountByDate, appConfig, productProfiles, $state){
    $scope.selectedProductProfiles = appConfig.selectedProductProfiles;
    $scope.productProfiles = productProfiles;
    $scope.stockCountByDate = stockCountByDate;
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityProducts = stockCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list

    $scope.monthList = stockCountFactory.monthList;
    $scope.dateActivated = appConfig.dateActivated;
    $scope.countInterval = appConfig.stockCountInterval;
    $scope.reminderDay= appConfig.reminderDay;
    $scope.maxList = 10;

    $scope.dateList = stockCountFactory.get.stockCountByIntervals($scope);

    $scope.missedEntry = function(date){
      return stockCountFactory.get.missingEntry(date, $scope);
    };
    $scope.takeAction = function(date){
      var missed = $scope.missedEntry(date);
      stockCountFactory.getStockCountByDate(date).then(function(stockCount){
        if(stockCount !== null){
          $scope.stockCount = stockCount;
          $scope.detailView = true;
          stockCountFactory.set.stock.editStatus($scope, date);
          $scope.mergedList = stockCountFactory.get.mergedStockCount(stockCount.unopened, $scope.facilityProductsKeys);
        }
        else if(!missed){
          $state.go('stockCountForm', {countDate: date});
        }
      });
    };
  })
  .controller('StockCountFormCtrl', function($scope, stockCountFactory, reminderFactory, $state, alertsFactory,
                                             $stateParams, appConfig, appConfigService, productType, cacheService,
                                             syncService, utility, $rootScope){
    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    $scope.productType = productType;

    $scope.step = 0;
    $scope.monthList = stockCountFactory.monthList;

    // get url parameters
    $scope.facilityObject = appConfig.appFacility;
    $scope.selectedProductProfiles = appConfig.selectedProductProfiles;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportDay = stockCountFactory.get.reminderDayFromDate($stateParams.reportDay, appConfig);
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();

    $scope.preview = false;
    $scope.editOn = false;


    $scope.stockCount = {};
    $scope.stockCount.unopened = {};
    $scope.stockCount.countDate = '';
    $scope.facilityProducts = stockCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }
    else{
      $scope.maxStep =0;
    }

    var updateUIModel = function(){
      $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step).name;
      $scope.productProfileUom =
          $scope.facilityProducts[$scope.facilityProductsKeys[$scope.step]].product.base_uom.symbol;
      $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    };

    $scope.edit = function(key){
      $scope.step = $scope.facilityProductsKeys.indexOf(key);
      $scope.productKey = key;
      $scope.preview = false;
      $scope.editOn = true;
      updateUIModel();
    };

    updateUIModel();

    var timezone = stockCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.reportDay;
    if($stateParams.countDate){
      date = $stateParams.countDate;
      $scope.reportDay = new Date(Date.parse(date)).getDate();
    }
    stockCountFactory.getStockCountByDate(date).then(function(stockCount){
      if(stockCount !== null){
        $scope.stockCount = stockCount;
        $scope.editOn = true; // enable edit mode
        if(angular.isUndefined($scope.stockCount.lastPosition)){
          $scope.stockCount.lastPosition = 0;
        }
      }
    });

    var saveQueue = queue(1);//use 1 to serialize the asynchronous task.
    var saveTask = function(callback){
      stockCountFactory.save.stock($scope.stockCount)
        .then(function(result){
          callback(undefined, result);
        })
        .catch(function(reason){
          callback(reason);
        });
    };

    $scope.save = function() {
      var DB_NAME = stockCountFactory.STOCK_COUNT_DB;

      $scope.stockCount.facility = $scope.facilityUuid;
      $scope.stockCount.countDate = new Date($scope.reportYear, parseInt($scope.reportMonth)-1, $scope.reportDay, timezone);
      //queue save task
      saveQueue.defer(saveTask);

      //if final save, redirect to home page.
      if ($scope.redirect) {
        saveQueue.awaitAll(function(err, result){
          if(result){
            $rootScope.showChart = true;
            $rootScope.isStockCountDue = false;//TODO:
            var msg = [
              'You have completed stock count for',
              $scope.reportDay,
              $scope.monthList[$scope.reportMonth],
              $scope.reportYear
            ].join(' ');
            $scope.isSaving = false;
            $state.go('home.index.home.mainActivity', {
              'facility': $scope.facilityUuid,
              'reportMonth': $scope.reportMonth,
              'reportYear': $scope.reportYear,
              'stockResult': msg
            });

            $scope.stockCount.uuid = result[0];//pick one uuid
            syncService.syncItem(DB_NAME, $scope.stockCount)
                .then(function (syncResult) {
                  console.info('stock count sync success: ' + syncResult);
                })
                .catch(function (reason) {
                  console.log(reason);
                });
          }else{
            console.log(err);
          }
        });
      }
    };

    $scope.finalSave = function(){
      $scope.isSaving = true;
      if('stockCount' in $scope) {
        $scope.stockCount.lastPosition = 0;
        $scope.stockCount.isComplete = 1;
      }
      $scope.redirect = true;
      $scope.save();

    };
    $scope.changeState = function(direction){
      $scope.currentEntry = $scope.stockCount.unopened[$scope.facilityProductsKeys[$scope.step]];
      if(stockCountFactory.validate.invalid($scope.currentEntry) && direction !== 0){
        stockCountFactory.get.errorAlert($scope, 1);
      }
      else{
        stockCountFactory.get.errorAlert($scope, 0);
        if(direction !== 2){
          $scope.step = direction === 0? $scope.step-1 : $scope.step + 1;
        }
        else{
          $scope.preview = true;
        }
        $scope.redirect = false;
        $scope.stockCount.lastPosition = $scope.step;
        if(angular.isUndefined($scope.stockCount.isComplete)){
          $scope.stockCount.isComplete = 0;
        }
        $scope.save();
        $scope.productKey = $scope.facilityProductsKeys[$scope.step];
      }
      updateUIModel();
      utility.scrollToTop();
    };
  });
