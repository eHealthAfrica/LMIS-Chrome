'use strict';
var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('InventoryCtrl', function ($scope, $location, storageService) {

        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.showWeeks = true;
        $scope.toggleWeeks = function () {
            $scope.showWeeks = ! $scope.showWeeks;
        };

        $scope.clear = function () {
            $scope.dt = null;
        };


        $scope.toggleMin = function() {
            //$scope.minDate = ( $scope.minDate ) ? null : new Date();
            $scope.minDate = null;
        };
        $scope.toggleMin();

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.format = 'MMMM yyyy';

  });

chromeApp.controller("StockRecordsCtrl",function($scope, $location, storageService){
    $scope.stock_records = {};
            storageService.get('facility').then(function(data){
                 $scope.facilities = data;
            });
            storageService.get('programs').then(function(data){
                 $scope.programs = data;
            });

            $scope.loadProducts = function(){
                $scope.stock_records.products = $scope.stock_records.program;
            }
});

chromeApp.controller("StockRecordsCtrlForm",function($scope, $location, storageService){
    $scope.stock_records = {};
    $scope.stock_records.received = {};
    $scope.stock_records.used = {};
    $scope.stock_records.balance = {};
    $scope.stock_records.expiry = {};
    $scope.stock_records.vvm = {};
    $scope.stock_records.breakage = {};
    $scope.stock_records.frozen = {};
    $scope.stock_records.label_removed = {};
    $scope.stock_records.others = {};

    storageService.get(storageService.PROGRAM_PRODUCTS).then(function(programProducts){
           $scope.programProductList = programProducts;
    });
    storageService.loadTableObject(storageService.PROGRAM).then(function(programs){
        $scope.programs_object = programs;
    });
    storageService.loadTableObject(storageService.PRODUCT).then(function(products){
        $scope.products_object = products;
    });
    storageService.get('facility').then(function(data){
         $scope.facilities = data;
    });
    storageService.get('programs').then(function(data){
         $scope.programs = data;
    });
     storageService.get(storageService.PROGRAM_PRODUCTS).then(function(data){
         $scope.program_products = data;
     });



});


