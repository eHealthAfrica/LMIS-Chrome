'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('MainCtrl', function ($scope, storageService, $location ) {
        var url_arr = $location.path().replace(/\/$/,'').replace(/^\//,'').split('/');
        var bc = [];
        if(url_arr.indexOf('products') != -1){
            bc = [{name:"Products", "link":''}];
        }
        else if(url_arr.indexOf('product_form') != -1){
            bc =
            [
                {name:"Products", "link":'#/main/products'},
                {name:"Form", "link":''}
            ];
        }
        else{
            bc = [];
        }
        $scope.addbreadcrumbs(bc);

        storageService.get('products').then(function(d){
           $scope.products = d;
        });
        //console.log($scope.products);
        /*$scope.$watch('online', function(newStatus) {})*/
    });

/**
    ProductListCtrl controller handles display of products pulled from storage.
*/
chromeApp.controller('ProductListCtrl', function ($scope, storageService) {

    storageService.get('products').then(function(product_list){
           $scope.products = product_list;
    });
});


/**
    AddProductCtrl - handles the addition of product to storage.
*/
chromeApp.controller('AddProductCtrl', function($scope, storageService){
    storageService.get('product_category').then(function(product_categories){
           $scope.categories = product_categories;
    });
});



