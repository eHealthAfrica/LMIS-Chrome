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
        templateUrl: 'views/stock-count/index.html',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          stockCounts: function(stockCountFactory){
            return stockCountFactory.getAll();
          },
          isStockCountDue: function(stockCountFactory, appConfig, $q) {
            if (angular.isObject(appConfig)) {
              return stockCountFactory.isStockCountDue(appConfig.facility.stockCountInterval, appConfig.facility.reminderDay);
            } else {
              $q.when(false);
            }
          },
          mostRecentStockCount: function(stockCountFactory) {
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
        url:'/stockCountForm?newStockCount&facility&reportMonth&reportYear&reportDay&uuid&productKey&detailView&editOff',
        templateUrl: 'views/stock-count/stock-count-form.html',
        controller: 'StockCountFormCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          mostRecentStockCount: function(stockCountFactory){
            return stockCountFactory.getMostRecentStockCount();
          }
        }
      });
  })
  .controller('StockCountHomeCtrl', function($scope, stockCountFactory, growl, i18n, utility, stockCounts, appConfig, $state, mostRecentStockCount, isStockCountDue){

    var sortByCreatedDateDesc = function(scA, scB){
      return new Date(scA.created) < new Date(scB.created);
    };
    var scInterval = appConfig.facility.stockCountInterval;
    var reminderDay = appConfig.facility.reminderDay;

    $scope.sortedStockCount = stockCounts.sort(sortByCreatedDateDesc);

    $scope.isEditable = function(stockCount) {
      return stockCountFactory.isEditable(stockCount, mostRecentStockCount, scInterval, reminderDay);
    };

    $scope.disableAddButton = function(){
      if(isStockCountDue){
        return stockCountFactory.isEditable(mostRecentStockCount, mostRecentStockCount, scInterval, reminderDay);
      }else{
        return mostRecentStockCount.isComplete !== 1;
      }
    };

    $scope.showStockCount = function(stockCount) {
      var isEditable = $scope.isEditable(stockCount);
      if (utility.has(stockCount, 'uuid') && utility.has(stockCount, 'countDate')) {
        if ((stockCount.isComplete === 1 && isEditable === true) || (stockCount.isComplete !== 1 && isEditable !== true)) {
          $state.go('stockCountForm', { detailView: true, uuid: stockCount.uuid, editOff: !isEditable });
        } else {
          $state.go('stockCountForm', { detailView: false, uuid: stockCount.uuid, editOff: !isEditable });
        }
      } else {
        growl.error(i18n('showStockCountFailed'));
      }
    };
  })
  .controller('StockCountFormCtrl', function($scope, stockCountFactory, reminderFactory, $state, growl, alertFactory,
                                             $stateParams, appConfig, appConfigService, cacheService, syncService,
                                             utility, $rootScope, i18n, mostRecentStockCount, geolocationFactory){

    var scInterval = appConfig.facility.stockCountInterval;
    var reminderDay = appConfig.facility.reminderDay;
    var isMostRecentEditable = stockCountFactory.isEditable(mostRecentStockCount, mostRecentStockCount, scInterval, reminderDay);

    //TODO: refactor entire stock count controller to simpler more readable controller
    $scope.getCategoryColor = function(categoryName){
      if($scope.preview){
        return;
      }
      return categoryName.split(' ').join('-').toLowerCase();
    };
    $scope.isNew = ($stateParams.newStockCount === 'true');

    function getUuid() {
      if (!angular.isString($stateParams.uuid) && isMostRecentEditable) {
        return mostRecentStockCount.uuid;
      }
      return $stateParams.uuid;
    }

    $scope.uuid = getUuid();

    $scope.step = 0;
    $scope.facilityObject = appConfig.facility;
    $scope.selectedProductProfiles = appConfig.facility.selectedProductProfiles;
    $scope.stockCountDate = stockCountFactory.getStockCountDueDate(appConfig.facility.stockCountInterval, appConfig.facility.reminderDay);
    $scope.dateInfo = new Date();
    $scope.preview = $scope.detailView = $stateParams.detailView;
    $scope.editOn = false;
    $scope.editOff = ($stateParams.editOff === 'true');
    $scope.countValue = {};
    $scope.stockCount = {};
    $scope.stockCount.unopened = {};
    $scope.facilityProducts = utility.castArrayToObject($scope.selectedProductProfiles, 'uuid');
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];


    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }else{
      $scope.maxStep = 0;
    }

    var updateUIModel = function(){
      $scope.productProfileUom = $scope.facilityProducts[$scope.productKey];
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

    //TODO: call pickStockCOunt here.
    stockCountFactory.getByUuid($scope.uuid)
      .then(function(stockCount) {
        if ($scope.isNew !== true && stockCount !== null) {
          $scope.stockCount = stockCount;
          $scope.dateInfo = $scope.stockCount.created;
          $scope.editOn = true; // enable edit mode
          if (angular.isUndefined($scope.stockCount.lastPosition)) {
            $scope.stockCount.lastPosition = 0;
          }
          updateCountValue();
        }
      });

    var syncStockCount = function(stockCountUUID) {
      var db = stockCountFactory.STOCK_COUNT_DB;
      var msg = i18n('stockCountSuccessMsg');
      $scope.stockCount.uuid = stockCountUUID;
      /*
       * FIXME: why stock count returns empty array when redirect is called
       * before syncService
       *
       * some side effects of this hack:
       *
       * 1. when device is connected to GPRS network with no data bundle, it
       *    takes a much longer time before it redirects to home page as it
       *    has to wait for syncService.canConnect to complete
       *
       * 2. redirect has to wait for app to finish syncing - success/fail
       */
      return syncService.syncUpRecord(db, $scope.stockCount)
        .catch(function(reason) {
          console.error(reason);
        })
        .finally(function() {
          $scope.isSaving = false;
          alertFactory.success(msg);
          $state.go('home.index.home.mainActivity');
        });
    };

    $scope.save = function() {
      $scope.stockCount.facility = $scope.facilityObject.uuid;
      $scope.stockCount.countDate = $scope.stockCountDate;

      stockCountFactory.save.stock($scope.stockCount)
        .then(function(stockCountUUID) {
          if ($scope.redirect) {
            return syncStockCount(stockCountUUID);
          }
        })
        .catch(function(reason) {
          var msg = i18n('stockCountSavingFailed');
          growl.error(msg);
          console.error(reason);
        });
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
      if(utility.has($scope, 'stockCount')) {
        $scope.stockCount.lastPosition = 0;
        $scope.stockCount.isComplete = 1;

        //attach position GeoPosition
        if(!angular.isObject($scope.stockCount.geoPosition)){
          $scope.stockCount.geoPosition = geolocationFactory.NO_GEO_POS;
        }
        geolocationFactory.getCurrentPosition()
          .then(function (curPos) {
            $scope.stockCount.geoPosition = geolocationFactory.getMiniGeoPosition(curPos);
            $scope.redirect = true;
            $scope.save();
          })
          .catch(function () {
            $scope.redirect = true;
            $scope.save();
          });
      }else{
        $scope.redirect = true;
        $scope.save();
      }

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
