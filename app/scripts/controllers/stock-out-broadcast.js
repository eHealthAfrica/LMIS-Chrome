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
      productTypes: function(productTypeFactory){
        return productTypeFactory.getAll();
      },
      appConfig: function(appConfigService){
        return appConfigService.load();
      }
    }
  })
}).controller('StockOutBroadcastCtrl', function($scope, productTypes, appConfig, $log, stockOutBroadcastFactory, $state,
        alertsFactory, $modal){

  $scope.productTypes = productTypes;

  //used to hold stock out form data
  $scope.stockOutForm = {
    productType: '',
    facility: appConfig.appFacility,
    isSubmitted: false
  };

  $scope.save = function(){

    var stockOut = {
      productType: JSON.parse($scope.stockOutForm.productType),
      facility: $scope.stockOutForm.facility
    };

    var modal = $modal.open({
      templateUrl: 'views/stock-out-broadcast/partials/confirm-stock-out-broadcast.html',
      backdrop : 'static',
      keyboard: false,
      resolve: {
        productType: function($q){
          var deferred = $q.defer();
          deferred.resolve(stockOut.productType);
          return deferred.promise;
        }
      },
      controller: function($scope, $state, $modalInstance, i18n, productType){
        console.log(productType);
        $scope.headerMessage = i18n('confirmStockOutHeader', productType.code);
        $scope.bodyMessage = i18n('confirmStockOutBodyMsg');
        $scope.confirmBtnMsg = i18n('yes');
        $scope.cancelBtnMsg = i18n('no');

        $scope.confirm = function(){
          var broadcastStockOutConfirmed = true;
          $modalInstance.close(broadcastStockOutConfirmed);
        };

        $scope.cancel = function(){
          $modalInstance.dismiss('you cancelled stock out broadcast');
        }

      }
    });

    modal.result.then(function (result) {
      if(result === true){
        stockOutBroadcastFactory.save(stockOut).then(function (result) {
          //TODO: send SMS or Online broadcast here.
          if (result !== undefined) {
            $state.go('home.index.mainActivity', {'stockOutBroadcastResult': true });
          }
        }, function (reason) {
          alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
          $log.error(reason);
        });
      }
    }, function (reason) {
      $log.info(reason);
    });

  };
});