'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('wasteCountHome', {
        parent: 'root.index',
        url: '/wasteCountHome',
        data: {
          label: 'Waste Count Home'
        },
        templateUrl: 'views/waste-count/waste-count.html',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          wasteCountList: function(wasteCountFactory){
            return wasteCountFactory.get.allWasteCount();
          }
        },
        controller: 'wasteCountHomeCtrl'
      })
      .state('wasteCountForm', {
        parent: 'root.index',
        data:{
          label:'Waste Count Form'
        },
        url: '/wasteCountForm?facility&reportMonth&reportYear&reportDay&countDate',
        templateUrl: 'views/waste-count/waste-count-form.html',
        controller:'wasteCountFormCtrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
      .state('wasteCountForm2', {
        parent: 'root.index',
        data:{
          label:'Waste Count Form'
        },
        url: '/wasteCountForm2?facility&reportMonth&reportYear&reportDay&countDate',
        templateUrl: 'views/waste-count/waste-count-form2.html',
        controller:'wasteCountForm2Ctrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      });
  })
  .controller('wasteCountHomeCtrl', function($scope, wasteCountFactory, wasteCountList, appConfig, $state){
    $scope.wasteCountList = wasteCountList;
    $scope.facilityProducts = wasteCountFactory.get.productObject(appConfig.selectedProductProfiles);
    $scope.missedEntry = function(date){
      return wasteCountFactory.get.missingEntry(date, $scope);
    };
    $scope.takeAction = function(date){
      wasteCountFactory.getWasteCountByDate(date).then(function(wasteCount){
        if(wasteCount !== null){
          $scope.wasteCount = wasteCount;
          $scope.detailView = true;

          $scope.wasteCountByType = wasteCountFactory.get.wasteCountByType(wasteCount, $scope.facilityProducts);
        }
        else{
          $state.go('wasteCountForm', {countDate: date});
        }
      });
    };

    $scope.getName = function(row){
      return wasteCountFactory.get.productName(row, $scope.facilityProducts);
    };

  })
/*
 * Waste Count Controller
 */
  .controller('wasteCountFormCtrl', function($scope, wasteCountFactory, $state, growl, $stateParams, appConfig, productType, utility){

    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    $scope.wasteReasons = wasteCountFactory.wasteReasons;
    $scope.productType = productType;
    $scope.reasonError = false;

    $scope.step = 0;
    $scope.monthList = wasteCountFactory.monthList;
    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    $scope.wasteErrors = {};
    $scope.wasteErrorMsg = {};
    $scope.currentDay = day;

    $scope.wasteCount = {};
    $scope.wasteCount.discarded = {};
    $scope.wasteCount.reason = {};

    $scope.wasteCount.countDate ='';

    $scope.facilityProducts = wasteCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility

    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    $scope.wasteCount.reason[$scope.productKey] = {};

    //set maximum steps
    if($scope.facilityProductsKeys.length > 0){
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

    $scope.selectedFacilityProduct = wasteCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
    $scope.productTypeCode = wasteCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    var timezone = wasteCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.currentDay;
    wasteCountFactory.getWasteCountByDate(date).then(function(wasteCount){
      if(wasteCount !== null){
        $scope.wasteCount = wasteCount;
        if(angular.isDefined($scope.wasteCount.lastPosition)){
          $scope.step = $scope.wasteCount.lastPosition;
          $scope.productKey = $scope.facilityProductsKeys[$scope.step];
        }
        $scope.editOn = true; // enable edit mode
        if(angular.isUndefined($scope.wasteCount.isComplete)){
          $scope.wasteCount.isComplete = 0; //and stock count entry as completed
        }
      }
      if(angular.isUndefined($scope.wasteCount.discarded[$scope.productKey])){
        $scope.wasteCount.discarded[$scope.productKey] = 0;
      }
      $scope.wasteCountByType = wasteCountFactory.get.wasteCountByType(wasteCount, $scope.facilityProducts);
    });

    $scope.save = function(){
      wasteCountFactory.save($scope, $state, growl);
    };

    $scope.finalSave = function(){
      $scope.isSaving = true;
      $scope.wasteCount.lastPosition = 0;
      $scope.redirect = true;
      $scope.wasteCount.isComplete = 1;
      $scope.save();
    };

    $scope.getName = function(row){
      return wasteCountFactory.get.productName(row, $scope.facilityProducts);
    };

    $scope.changeState = function(direction){
      wasteCountFactory.validate.waste.changeState($scope, direction);
      $scope.wasteCountByType = wasteCountFactory.get.wasteCountByType($scope.wasteCount, $scope.facilityProducts);
      utility.scrollToTop();
    };

    wasteCountFactory.watchWasteed($scope);
  })
/**
 * waste count form 2
  */

  .controller('wasteCountForm2Ctrl', function($scope, wasteCountFactory, $state, growl, $stateParams, appConfig, productType, i18n){
    var initWasteCount = function(wasteCount){
      if(wasteCount !== null && wasteCount !== undefined){
        $scope.wasteCount = wasteCount;
      }
      else{
        $scope.wasteCount = {};
        $scope.wasteCount.facility = appConfig.appFacility.uuid;
        $scope.wasteCount.reason = {};
        $scope.wasteCount.discarded = {};
      }
    };

    var initReason = function (){
      if(angular.isUndefined($scope.wasteCount.reason[$scope.productKey])){
        $scope.wasteCount.reason[$scope.productKey] = {};
      }
    };

    initWasteCount();
    $scope.wasteReasons = wasteCountFactory.wasteReasons;
    $scope.productType = productType;
    $scope.facilityProducts = wasteCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility

    wasteCountFactory.getWasteCountByDate(new Date())
        .then(function(wasteCount){
           initWasteCount(wasteCount);
        });

    $scope.$watch('reasonQuantity', function(newValue){
      if(angular.isDefined(newValue)){
        initReason();
        $scope.wasteCount.discarded[$scope.productKey] = $scope.reasonQuantity;
        $scope.wasteCount.reason[$scope.productKey][$scope.selectedReason]= $scope.reasonQuantity;
      }
    });

    $scope.loadSelected = function(){
      initReason();
      $scope.reasonQuantity = $scope.wasteCount.reason[$scope.productKey][$scope.selectedReason];
    };

    $scope.save = function(type){
      $scope.isSaving = true;
      $scope.wasteCount.countDate = new Date();
      $scope.wasteCount.isComplete = 1;
      wasteCountFactory.add($scope.wasteCount)
          .then(function(){
            $scope.isSaving = false;
            var msg = i18n('wasteCountSaved');
            growl.success(msg);
            if(type === 0){
              $state.go('home.index.home.mainActivity', {'stockResult': msg});
            }
            else{
              $scope.productKey = '';
              $scope.selectedReason = '';
              $scope.reasonQuantity = '';
            }
          });
    };

  });