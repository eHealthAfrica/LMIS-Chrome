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
}).controller('MultiStockOutBroadcastCtrl', function($scope,appConfig, notificationService, $log, stockOutBroadcastFactory, $state, growl,
                                                 i18n, facilityStockListProductTypes, $stateParams, inventoryRulesFactory, $q){

  $scope.urlParams = ($stateParams.productList !== null) ? ($stateParams.productList).split(',') : $stateParams.productList;
  var stockOutProductTypes = facilityStockListProductTypes.filter(function (element) {
    return $scope.urlParams.indexOf(element.uuid) !== -1;
  });

  $scope.stockOutProductTypes = stockOutProductTypes;

  //used to hold stock out form data
  $scope.stockOutForm = {
    productType: stockOutProductTypes,
    facility: appConfig.appFacility,
    isSubmitted: false
  };

  $scope.isSaving = false;

  $scope.save = function () {

    $scope.isSaving = true;

    var saveAndBroadcastStockOut = function (productList) {
      var deferred = $q.defer();

      var addNextStockLevelAndSave = function (productList, index) {
        var nextIndex = index - 1;
        if (nextIndex >= 0) {
          var stockOut = {
            productType: productList[nextIndex],
            facility: $scope.stockOutForm.facility
          };
          stockOutBroadcastFactory.addStockLevelAndSave(stockOut)
              .then(function (result) {
                //broadcast in the background
                stockOutBroadcastFactory.broadcast(result);
                addNextStockLevelAndSave(productList, nextIndex);
              })
              .catch(function () {
                addNextStockLevelAndSave(productList, nextIndex)
              });
        } else {
          deferred.resolve(true);//
        }
        return deferred.promise;
      };

      addNextStockLevelAndSave(productList, productList.length)
          .then(function (result) {
            $scope.isSaving = false;
            $state.go('home.index.home.mainActivity', {stockOutBroadcastResult: true });
          })
          .catch(function (reason) {
            growl.error(i18n('stockOutBroadcastFailedMsg'));
            $log.error(reason);
          });
    };

    var title = [];
    for (var i = 0; i < stockOutProductTypes.length; i++) {
      title.push(stockOutProductTypes[i].code);
    }

    var confirmationTitle = i18n('confirmStockOutHeader', title.join(', '));
    var confirmationQuestion = i18n('dialogConfirmationQuestion');
    var buttonLabels = [i18n('yes'), i18n('no')];

    notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function (isConfirmed) {
          if (isConfirmed === true) {
            saveAndBroadcastStockOut(stockOutProductTypes);
          }
        })
        .catch(function (reason) {
          $scope.isSaving = false;
          $log.info(reason);
        });
  };

}).controller('StockOutBroadcastCtrl', function($scope,appConfig, $log, stockOutBroadcastFactory, $state, growl,
                                                $modal, i18n, facilityStockListProductTypes, notificationService){

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

    notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function (isConfirmed) {
          if (isConfirmed === true) {
            stockOutBroadcastFactory.addStockLevelAndSave(stockOut)
                .then(function (result) {
                  if (typeof result !== 'undefined') {
                    $state.go('home.index.home.mainActivity', {stockOutBroadcastResult: true });
                    stockOutBroadcastFactory.broadcast(result)
                        .then(function (result) {
                          $log.info('stock-out broad-casted: ' + result);
                        }, function (reason) {
                          $log.error(reason);
                        });
                  } else {
                    growl.error(i18n('stockOutBroadcastFailedMsg'));
                    $scope.isSaving = false;
                  }
                })
                .catch(function (reason) {
                  growl.error(i18n('stockOutBroadcastFailedMsg'));
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

});