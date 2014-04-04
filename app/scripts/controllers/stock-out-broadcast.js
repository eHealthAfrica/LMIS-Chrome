'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('broadcastStockOut', {
    url: '/broadcast-stock-out',
    parent: 'root.index',
    templateUrl: 'views/stock-out-broadcast/stock-out-broadcast.html',
    controller: 'stockOutBroadcastCtrl',
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
}).controller('stockOutBroadcastCtrl', function($scope, productTypes, appConfig, $log, stockOutBroadcastFactory, $state,
        alertsFactory){

  //used to hold stock out form data
  $scope.stockOutForm = {
    productType: '',
    quantityNeeded: null,
    facility: appConfig.appFacility,
    isSubmitted: false
  };

  $scope.productTypes = productTypes;

  $scope.save = function(){

    var stockOut = {
      productType: JSON.parse($scope.stockOutForm.productType),
      quantityNeeded: $scope.stockOutForm.quantityNeeded,
      facility: $scope.stockOutForm.facility,
    };

    stockOutBroadcastFactory.save(stockOut).then(function(result){
      //TODO: send SMS or Online broadcast here.
      if(result !== undefined){
        $state.go('home.index.mainActivity',{'stockOutBroadcastResult': true });
      }
    }, function(reason){
      alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
      $log.error(reason);
    });
  };
});