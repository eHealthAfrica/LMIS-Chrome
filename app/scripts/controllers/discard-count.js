'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('discardCountHome', {
        parent: 'root.index',
        url: '/discardCountHome',
        data: {
          label: 'Discard Count Home'
        },
        templateUrl: 'views/discard-count/discard-count.html',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          },
          discardCountList: function(discardCountFactory){
            return discardCountFactory.get.allDiscardCount();
          },
          productProfiles: function(discardCountFactory){
            return discardCountFactory.get.productProfile();
          }
        },
        controller: function($scope, discardCountFactory, discardCountList, appConfig, productProfiles, $state, $filter){
          $scope.discardCountList = discardCountList;
          $scope.discardCountByDate = discardCountFactory.get.discardCountListByDate($scope.discardCountList);
          $scope.productProfiles = productProfiles;

          $scope.facilityObject = appConfig.appFacility;
          $scope.facilityProducts = discardCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility

          $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list

          var now = new Date();
          $scope.currentDay = now.getDate();
          $scope.day = $scope.currentDay;
          $scope.currentMonth = (now.getMonth()+1) < 10 ? '0'+(now.getMonth()+1) : now.getMonth()+1;
          $scope.month = $scope.currentMonth;
          $scope.currentYear = now.getFullYear();
          $scope.year = $scope.currentYear;

          $scope.dateActivated = appConfig.dateActivated;
          $scope.countInterval = appConfig.stockCountInterval;
          $scope.reminderDay= appConfig.reminderDay;
          $scope.maxList = 10;

          $scope.dateList = discardCountFactory.get.discardCountByIntervals($scope);

          $scope.missedEntry = function(date){
           return discardCountFactory.get.missingEntry(date, $scope);
          };
          $scope.takeAction = function(date){
            var missed = $scope.missedEntry(date);
            discardCountFactory.getDiscardCountByDate(date).then(function(discardCount){
              if(discardCount !== null){
                $scope.discardCount = discardCount;
                $scope.detailView = true;
                if($filter('date')(new Date(), 'yyyy-MM-dd') !== $filter('date')(discardCount.countDate, 'yyyy-MM-dd')){
                  $scope.editOff = true;
                }
                //$scope.mergedList = discardCountFactory.get.mergedDiscardCount(discardCount.unopened, $scope.facilityProductsKeys);
                $scope.discardCountByType = discardCountFactory.get.discardCountByType(discardCount);
              }
              else if(!missed){
                $state.go('discardCountForm', {countDate: date});
              }
            });
          };

          $scope.getName = function(row){
            return discardCountFactory.get.productName(row, $scope.facilityProducts);
          };

        }
      })
      .state('discardCountForm', {
        parent: 'root.index',
        data:{
          label:'Discard Count Form'
        },
        url: '/discardCountForm?facility&reportMonth&reportYear&reportDay&countDate',
        templateUrl: 'views/discard-count/discard-count-form.html',
        controller:'discardCountFormCtrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.load();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
  })
/*
 * Discard Count Controller
 */
  .controller('discardCountFormCtrl', function($scope, discardCountFactory, $state, alertsFactory, $stateParams, appConfig, productType){

    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    $scope.discardedReasons = discardCountFactory.discardedReasons;
    $scope.productType = productType;
    $scope.reasonError = false;

    $scope.step = 0;
    $scope.monthList = discardCountFactory.monthList;
    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    $scope.discardErrors = {};
    $scope.discardErrorMsg = {};
    $scope.currentDay = day;

    $scope.discardCount = {};
    $scope.discardCount.discarded = {};
    $scope.discardCount.reason = {};

    $scope.discardCount.countDate ='';

    $scope.facilityProducts = discardCountFactory.get.productObject(appConfig.selectedProductProfiles); // selected products for current facility

    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    $scope.discardCount.reason[$scope.productKey] = {};

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

    $scope.selectedFacilityProduct = discardCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
    $scope.productTypeCode = discardCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    var timezone = discardCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.currentDay;
    discardCountFactory.getDiscardCountByDate(date).then(function(discardCount){
      if(discardCount !== null){
        $scope.discardCount = discardCount;
        if(angular.isDefined($scope.discardCount.lastPosition)){
          $scope.step = $scope.discardCount.lastPosition;
          $scope.productKey = $scope.facilityProductsKeys[$scope.step];
        }
        $scope.editOn = true; // enable edit mode
        if(angular.isUndefined($scope.discardCount.isComplete)){
          $scope.discardCount.isComplete = 0; //and stock count entry as completed
        }
      }
      if(angular.isUndefined($scope.discardCount.discarded[$scope.productKey])){
        $scope.discardCount.discarded[$scope.productKey] = 0;
      }
      $scope.discardCountByType = discardCountFactory.get.discardCountByType(discardCount);
    });

    $scope.save = function(){
      discardCountFactory.save($scope, $state, alertsFactory);
    };

    $scope.finalSave = function(){
      $scope.discardCount.lastPosition = 0;
      $scope.redirect = true;
      $scope.discardCount.isComplete = 1;
      $scope.save();
    };

    $scope.getName = function(row){
      return discardCountFactory.get.productName(row, $scope.facilityProducts);
    };

    $scope.changeState = function(direction){
      discardCountFactory.validate.discard.changeState($scope, direction);
      $scope.discardCountByType = discardCountFactory.get.discardCountByType($scope.discardCount);
    };

    discardCountFactory.watchDiscarded($scope);
  });