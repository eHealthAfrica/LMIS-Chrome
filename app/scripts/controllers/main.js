'use strict';

angular.module('lmisChromeApp')
    .controller('MainCtrl', function ($scope, storageService, $location ) {
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