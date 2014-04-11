'use strict';

angular.module('lmisChromeApp')
  .config(function($urlRouterProvider, $stateProvider) {
    $stateProvider.state('dashboard', {
      parent: 'root.index',
      templateUrl: 'views/dashboard/dashboard.html',
      resolve: {
        stockCountList: function(stockCountFactory){
          return stockCountFactory.get.allStockCount();
        },
        productProfiles: function(stockCountFactory){
          return stockCountFactory.get.productProfile();
        }
      },
      controller: function($scope, stockCountList, productProfiles) {
        var stockCount = stockCountList[0];
        var values = [], label = '';
        for(var product in stockCount.unopened) {
          label = productProfiles[product].name || product;
          values.push([label, stockCount.unopened[product]]);
        }
        $scope.stockChart = [
          {
            key: 'Product',
            values: values
          }
        ];
      }
    });
  });
