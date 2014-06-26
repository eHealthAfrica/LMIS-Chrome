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
        url: '/wasteCountForm2?facility&reportMonth&reportYear&reportDay&countDate',
        templateUrl: 'views/waste-count/waste-count-form2.html',
        controller:'wasteCountFormCtrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.getCurrentAppConfig();
          }
        }
      });
  })
  .controller('wasteCountHomeCtrl', function($scope, wasteCountFactory, wasteCountList, appConfig, $state, $filter){

    $scope.wasteCountList = wasteCountList;
    $scope.today = $filter('date')(new Date(), 'yyyy-MM-dd');
    $scope.facilityProducts = wasteCountFactory.get.productObject(appConfig.facility.selectedProductProfiles);

    $scope.takeAction = function(date){
      wasteCountFactory.getWasteCountByDate(date).then(function(wasteCount){
        if(wasteCount !== null){
          $scope.wasteCount = wasteCount;
          $scope.detailView = true;
          $scope.wasteCountByType = wasteCountFactory.get.wasteCountByType(wasteCount, $scope.facilityProducts);
          if($filter('date')(wasteCount.countDate, 'yyyy-MM-dd') === $scope.today){
            $scope.editOn = true;
          }
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
/**
 * waste count form 2
 */

  .controller('wasteCountFormCtrl', function($scope, wasteCountFactory, $state, growl, $stateParams, appConfig,
                                              i18n, syncService, alertFactory){

    var getCountDate = function(){
      return ($stateParams.countDate === null) ? new Date() : new Date($stateParams.countDate);
    };
    var initWasteCount = function(wasteCount){
      if(wasteCount !== null && wasteCount !== undefined){
        $scope.wasteCount = wasteCount;
      }
      else{
        $scope.wasteCount = {};
        $scope.wasteCount.facility = appConfig.facility.uuid;
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
    $scope.facilityProducts = wasteCountFactory.get.productObject(appConfig.facility.selectedProductProfiles); // selected products for current facility

    wasteCountFactory.getWasteCountByDate(getCountDate())
        .then(function(wasteCount){
           initWasteCount(wasteCount);
        });

    $scope.change = function(){
      if(angular.isDefined($scope.reasonQuantity)){
        initReason();
        $scope.wasteCount.discarded[$scope.productKey] = $scope.reasonQuantity;
        $scope.wasteCount.reason[$scope.productKey][$scope.selectedReason]= $scope.reasonQuantity;
      }
    };

    $scope.loadSelected = function(){
      initReason();
      $scope.reasonQuantity = $scope.wasteCount.reason[$scope.productKey][$scope.selectedReason];
      var uom = $scope.productKey !== ''?$scope.facilityProducts[$scope.productKey].presentation.uom.symbol : '';
      $scope.enterQuantityLabel = i18n('enterQuantity', uom);
    };

    $scope.save = function(type){
      $scope.isSaving = true;
      $scope.wasteCount.countDate =  getCountDate();
      $scope.wasteCount.isComplete = 1;
      wasteCountFactory.add($scope.wasteCount)
          .then(function(uuid){
            $scope.wasteCount.uuid = uuid;
            syncService.syncItem(wasteCountFactory.DB_NAME, $scope.wasteCount)
              .finally(function(){
                $scope.isSaving = false;
                alertFactory.success(i18n('wasteCountSaved'));
                $state.go('home.index.home.mainActivity');
              });
          })
          .catch(function(reason){
            console.error(reason);
            growl.error(reason);
          });
    };

  });