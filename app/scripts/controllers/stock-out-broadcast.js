'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('broadcastStockOut', {
    url: '/broadcast-stock-out',
    parent: 'root.index',
    templateUrl: 'views/stock-out-broadcast/stock-out-broadcast.html',
    controller: 'StockOutBroadcastCtrl',
    data: {
      label: 'Broadcast stock-out'
    },
    resolve: {
      appConfig: function(appConfigService){
        return appConfigService.getCurrentAppConfig();
      },
      facilityStockListProductTypes: function(appConfigService){
        return appConfigService.getProductTypes();
      }
    }
  })
  .state('multiStockOutBroadcast', {
    url: '/multiStockOutBroadcast?productList',
    parent: 'root.index',
    templateUrl: 'views/stock-out-broadcast/multi-stock-out-broadcast.html',
    data: {
      label: 'Broadcast Multiple Stock Out'
    },
    resolve: {
      appConfig: function(appConfigService){
        return appConfigService.getCurrentAppConfig();
      },
      facilityStockListProductTypes: function(appConfigService){
        return appConfigService.getProductTypes();
      }
    },
    controller: 'MultiStockOutBroadcastCtrl'
  });
}).controller('MultiStockOutBroadcastCtrl', function($scope,appConfig, notificationService, $log, stockOutBroadcastFactory, $state, alertsFactory,
                                                 i18n, facilityStockListProductTypes, $stateParams){

  $scope.productTypes = facilityStockListProductTypes;

  $scope.urlParams = ($stateParams.productList !== null) ? ($stateParams.productList).split(',') : $stateParams.productList;

  var filteredProduct = facilityStockListProductTypes.filter(function (element) {
    return $scope.urlParams.indexOf(element.uuid) !== -1;
  });

  $scope.filteredProduct = filteredProduct;
  //used to hold stock out form data
  $scope.stockOutForm = {
    productType: filteredProduct,
    facility: appConfig.appFacility,
    isSubmitted: false
  };

  $scope.isSaving = false;

  $scope.save = function () {

    $scope.isSaving = true;
    var saveAndBroadcastStockOut = function (productList) {
      var stockOutList = [];
      for (var i = 0; i < productList.length; i++) {
        var stockOut = {
          productType: productList[i],
          facility: $scope.stockOutForm.facility
        };
        stockOutList.push(stockOut);
      }
      stockOutBroadcastFactory.saveBatch(stockOutList)
          .then(function (result) {
            for(var i = 0; i < result.length; i++){
               stockOutBroadcastFactory.broadcast(result[i]);//sync in the background
            }
            $scope.isSaving = false;
            $state.go('home.index.home.mainActivity', {stockOutBroadcastResult: true });
          }, function (reason) {
            alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
            $log.error(reason);
          })
          .catch(function (reason) {
            alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
            $log.error(reason);
          });
    };

    var title = [];
    for (var i = 0; i < filteredProduct.length; i++) {
      title.push(filteredProduct[i].code);
    }

    var confirmationTitle = i18n('confirmStockOutHeader', title.join(', '));
    var confirmationQuestion = i18n('dialogConfirmationQuestion');
    var buttonLabels = [i18n('yes'), i18n('no')];

    notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function (isConfirmed) {
          if (isConfirmed === true) {
            saveAndBroadcastStockOut(filteredProduct);
          }
        })
        .catch(function (reason) {
          $scope.isSaving = false;
          $log.info(reason);
        });
  };

}).controller('StockOutBroadcastCtrl', function($scope,appConfig, $log, stockOutBroadcastFactory, $state, alertsFactory,
                                                $modal, i18n, facilityStockListProductTypes, notificationService,
                                                inventoryRulesFactory){

  stockOutBroadcastFactory.getAll()
      .then(function(stockOutList){
        console.log(stockOutList);
      });

  $scope.productTypes = facilityStockListProductTypes;

  //used to hold stock out form data
  $scope.stockOutForm = {
    productType: '',
    facility: appConfig.appFacility,
    isSubmitted: false
  };

  $scope.isSaving = false;

  $scope.save = function(){
    $scope.isSaving = true;
    var productType = JSON.parse($scope.stockOutForm.productType);
    var confirmationTitle = i18n('confirmStockOutHeader', productType.code);
    var confirmationQuestion = i18n('dialogConfirmationQuestion');
    var buttonLabels = [i18n('yes'), i18n('no')];

    var stockOut = {
      productType: productType,
      facility: $scope.stockOutForm.facility
    };

    inventoryRulesFactory.getStockLevel($scope.stockOutForm.facility, productType)
        .then(function (result) {
          stockOut.stockLevel = result;
          confirmStockOutAlert(stockOut);
        })
        .catch(function (reason) {
          confirmStockOutAlert(stockOut);
        });

    var confirmStockOutAlert = function (stockOut) {
      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
          .then(function (isConfirmed) {
            if (isConfirmed === true) {
              stockOutBroadcastFactory.save(stockOut)
                  .then(function (result) {
                    if (typeof result !== 'undefined' || result !== null) {
                      $state.go('home.index.home.mainActivity', {stockOutBroadcastResult: true });
                      stockOut.uuid = result;
                      stockOutBroadcastFactory.broadcast(stockOut)
                          .then(function (result) {
                            $log.info('stock-out broad-casted: ' + result);
                          }, function (reason) {
                            $log.error(reason);
                          });
                    } else {
                      alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
                      $scope.isSaving = false;
                    }
                  })
                  .catch(function (reason) {
                    alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
                    $scope.isSaving = false;
                    $log.error(reason);
                  });
            }
          })
          .catch(function (reason) {
            $scope.isSaving = false;
            $log.info(reason);
          });
    };


  };

});