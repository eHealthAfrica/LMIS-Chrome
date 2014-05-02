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
        return appConfigService.getFacilityStockListProductTypes();
      }
    }
  })
}).controller('StockOutBroadcastCtrl', function($scope,appConfig, $log, stockOutBroadcastFactory, $state, alertsFactory,
                                                $modal, i18n, facilityStockListProductTypes){

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

    var saveAndBroadcastStockOut = function(stockOut){
      stockOutBroadcastFactory.save(stockOut).then(function (result) {
          if (typeof result !== 'undefined' || result !== null) {
            $state.go('home.index.home.mainActivity', {stockOutBroadcastResult: true });
            $scope.isSaving = false;
            stockOut.uuid = result;
            stockOutBroadcastFactory.broadcast(stockOut)
            .then(function (result) {
                  $log.info('stock-out broad-casted');
                }, function (reason) {
                  $log.error(reason);
                })
          }else{
            alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
            $scope.isSaving = false;
          }
      })
      .catch(function(reason){
        alertsFactory.danger(i18n('stockOutBroadcastFailedMsg'));
        $scope.isSaving = false;
        $log.error(reason);
      });
    };

    //TODO: move confirm dialogs to a service/factory.
    if(typeof navigator.notification !== 'undefined'  && typeof navigator.notification.confirm !== 'undefined'){

      //FIXME: refactor mobile dialog and chrome dialog to use same variable for label name, title, etc.
      var buttonLabels = i18n('yes')+','+i18n('no');
      var confirmationTitle = i18n('confirmStockOutHeader', stockOut.productType.code);
      var confirmationQuestion = i18n('confirmStockOutBodyMsg');

      navigator.notification.confirm(confirmationQuestion, function(index){
        var YES_INDEX = 1; //position in buttonLabels text + 1.
        if(index === YES_INDEX){
          saveAndBroadcastStockOut(stockOut);
        }else{
          $scope.isSaving = false;
        }
      },
      confirmationTitle, buttonLabels);

    }else{
      //confirm dialog for chrome app version.
      var modal = $modal.open({
        templateUrl: 'views/stock-out-broadcast/partials/confirm-stock-out-broadcast.html',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          productType: function ($q) {
            var deferred = $q.defer();
            deferred.resolve(stockOut.productType);
            return deferred.promise;
          }
        },
        controller: function ($scope, $state, $modalInstance, i18n, productType) {
          $scope.headerMessage = i18n('confirmStockOutHeader', productType.code);
          $scope.bodyMessage = i18n('confirmStockOutBodyMsg');
          $scope.confirmBtnMsg = i18n('yes');
          $scope.cancelBtnMsg = i18n('no');

          $scope.confirm = function () {
            var broadcastStockOutConfirmed = true;
            $modalInstance.close(broadcastStockOutConfirmed);
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('you cancelled stock out broadcast');
          }

        }
      });

      modal.result.then(function (result) {
        if (result === true) {
          saveAndBroadcastStockOut(stockOut);
        }
        $scope.isSaving = false;
      }, function (reason) {
        $log.info(reason);
        $scope.isSaving = false;
      });

    }

  };

});
