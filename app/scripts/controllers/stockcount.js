'use strict';

angular.module('lmisChromeApp')
.config(function($stateProvider) {
    $stateProvider
    .state('stock_count_index', {
      templateUrl: 'views/stockcount/index.html',
      controller:'StockCountCtrl'
    })
    .state('stock_count_form', {
      templateUrl: 'views/stockcount/daily_stock_count_form.html',
      controller: 'StockCountFormCtrl'
    })
    .state('waste_count_form', {
      templateUrl: 'views/stockcount/daily_waste_count_form.html',
      controller:'WasteCountFormCtrl'
    });
})
.controller('StockCountCtrl', function ($scope) {


 })
.controller('StockCountFormCtrl', function($scope, inventoryFactory){
    $scope.stock_products = inventoryFactory.stock_records.program_products;
})
.controller('WasteCountFormCtrl', function($scope){

});
