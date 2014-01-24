'use strict';

angular.module('lmisChromeApp')
  .controller('InventoryCtrl', function ($scope, $location, storageService) {


        var url_arr = $location.path().replace(/\/$/,'').replace(/^\//,'').split('/');
        var bc = [];
        if(url_arr.indexOf('stock_records') != -1){
            bc = [{name:"Inventory", "link":'#/inventory/index'}, {name:"Stock Records", "link":''}];
        }
        else if(url_arr.indexOf('stock_records_form') != -1){
            storageService.get('facility').then(function(data){
                 $scope.facilities = data;
            });
            storageService.get('programs').then(function(data){
                 $scope.programs = data;
            });
            bc =
            [
                {name:"Inventory", "link":'#/inventory/index'},
                {name:"Stock Records", "link":'#/inventory/stock_records'},
                {name:"Form", "link":''}
            ];
        }
        else{
            bc = [{name:"Inventory", "link":''}];
        }
        $scope.addbreadcrumbs(bc);


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

        // Disable weekend selection
        //$scope.disabled = function(date, mode) {
          //  return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        //};

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
