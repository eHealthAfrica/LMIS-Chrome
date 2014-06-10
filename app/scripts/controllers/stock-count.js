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
            return stockCountFactory.getStockCountListByDate();
          },
          mostRecentStockCount: function(stockCountFactory){
            return stockCountFactory.getMostRecentStockCount();
          }
        },
        controller: 'StockCountHomeCtrl'
      })
      .state('stockCountForm', {
        parent: 'root.index',
        data:{
          label:'Stock Count Form'
        },
        url:'/stockCountForm?facility&reportMonth&reportYear&reportDay&countDate&productKey&detailView&editOff',
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
      });
  })
  .controller('StockCountHomeCtrl', function($scope, stockCountFactory, stockCountByDate, appConfig, $state, mostRecentStockCount){
    $scope.stockCountsByCountDate = stockCountByDate;
    $scope.stockCountCountDates =  Object.keys($scope.stockCountsByCountDate).reverse();

   $scope.isEditable = function(stockCount){
     return (typeof mostRecentStockCount !== 'undefined') && (mostRecentStockCount.uuid=== stockCount.uuid);
   };

    $scope.showStockCountFormByDate = function(date){
      stockCountFactory.getStockCountByDate(date)
          .then(function (stockCount) {
            if (stockCount !== null) {
              $state.go('stockCountForm', {detailView: true, countDate: date, editOff: !$scope.isEditable(stockCount) });
            } else {
              $state.go('stockCountForm', {countDate: date});
            }
          })
          .catch(function () {
            //TODO: decide what happens if for any reason, retrieving stock count fails.
          });
    };
  })
  .controller('StockCountFormCtrl', function($scope, stockCountFactory, reminderFactory, $state, growl,
                                             $stateParams, appConfig, appConfigService, productType, cacheService,
                                             syncService, utility, $rootScope, i18n){
    //TODO: refactor entire stock count controller to simpler more readable controller

    $scope.productType = productType;
    $scope.step = 0;
    $scope.facilityObject = appConfig.appFacility;
    $scope.selectedProductProfiles = appConfig.selectedProductProfiles;
    $scope.stockCountDate = stockCountFactory.getStockCountDueDate(appConfig.stockCountInterval, appConfig.reminderDay);
    $scope.dateInfo = new Date();
    $scope.preview = $scope.detailView = $stateParams.detailView;
    $scope.editOn = false;
    $scope.editOff = ($stateParams.editOff === 'true');
    $scope.countValue = {};
    $scope.stockCount = {};
    $scope.stockCount.unopened = {};
    $scope.facilityProducts = stockCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }else{
      $scope.maxStep = 0;
    }

    var updateUIModel = function(){
      $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
      $scope.productProfileUom =
          $scope.facilityProducts[$scope.facilityProductsKeys[$scope.step]];
      $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    };

    var updateCountValue = function(){
      if(angular.isDefined($scope.stockCount.unopened[$scope.productKey])){
        var value = $scope.facilityProducts[$scope.productKey].presentation.value;
        $scope.countValue[$scope.productKey] = ($scope.stockCount.unopened[$scope.productKey]/value);
      }
    };

    $scope.convertToPresentationUom = function(){
      if(angular.isDefined($scope.countValue[$scope.productKey])){
        var value = $scope.facilityProducts[$scope.productKey].presentation.value;
        $scope.stockCount.unopened[$scope.productKey] = $scope.countValue[$scope.productKey] * value;
      }
    };
    updateUIModel();

    //load existing count for the day if any.
    var date = $scope.stockCountDate;
    if($stateParams.countDate){
      date = $stateParams.countDate;
      $scope.reportDay = new Date(Date.parse(date)).getDate();
    }
    stockCountFactory.getStockCountByDate(date).then(function(stockCount){
      if(stockCount !== null){
        $scope.stockCount = stockCount;
        $scope.dateInfo = $scope.stockCount.created;
        $scope.editOn = true; // enable edit mode
        if(angular.isUndefined($scope.stockCount.lastPosition)){
          $scope.stockCount.lastPosition = 0;
        }
        updateCountValue();
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

      $scope.stockCount.facility = $scope.facilityObject.uuid;
      $scope.stockCount.countDate = $scope.stockCountDate;
      //queue save task
      saveQueue.defer(saveTask);

      //if final save, redirect to home page.
      if ($scope.redirect) {
        saveQueue.awaitAll(function(err, result){
          if(result){
            $rootScope.showChart = true;
            $rootScope.isStockCountDue = false;//TODO:
            var msg = i18n('stockCountSuccessMsg');
            $scope.isSaving = false;
            $state.go('home.index.home.mainActivity', {'stockResult': msg});

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

    $scope.edit = function(key){
      if($scope.editOff === false){
        $scope.step = $scope.facilityProductsKeys.indexOf(key);
        $scope.productKey = key;
        $scope.preview = false;
        $scope.editOn = true;
        updateUIModel();
        updateCountValue();
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

      $scope.currentEntry = $scope.countValue[$scope.facilityProductsKeys[$scope.step]];
      if(stockCountFactory.validate.invalid($scope.currentEntry) && direction !== 0){
        stockCountFactory.get.errorAlert($scope, 1);
      }
      else{
        $scope.convertToPresentationUom();
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
      updateCountValue();
      updateUIModel();
      utility.scrollToTop();
    };
  });
