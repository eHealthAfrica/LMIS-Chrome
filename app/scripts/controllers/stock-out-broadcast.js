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
}).controller('StockOutBroadcastCtrl', function($scope,appConfig, $log, stockOutBroadcastFactory, $state, alertsFactory,
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

    var stockOut = {
      productType: JSON.parse($scope.stockOutForm.productType),
      facility: $scope.stockOutForm.facility
    };

    var confirmationTitle = i18n('confirmStockOutHeader', stockOut.productType.code);
    var confirmationQuestion = i18n('dialogConfirmationQuestion');
    var buttonLabels = [i18n('yes'), i18n('no')];

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
                          $log.info('stock-out broad-casted');
                        }, function (reason) {
                          $log.error(reason);
                        })
                  } else {
                    alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
                  }
                })
                .catch(function (reason) {
                  alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
                  $log.error(reason);
                })
                .finally(function () {
                  $scope.isSaving = false;
                });
          }
        })
        .catch(function (reason) {
          $scope.isSaving = false;
          $log.info(reason);
        });

  };

});
