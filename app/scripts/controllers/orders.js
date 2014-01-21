'use strict';

angular.module('lmisChromeApp')
  .controller('OrdersctrlCtrl', function ($scope, storageService, $location ) {
        var url_arr = $location.path().replace(/\/$/,'').replace(/^\//,'').split('/');
        var bc = [];
        if(url_arr.indexOf('purchase_order') != -1){
            bc = [{name:"Orders", "link":'#/orders/index'}, {name:"Purchase Order", "link":''}];
        }
        else if(url_arr.indexOf('purchase_order_form') != -1){
            bc =
            [
                {name:"Orders", "link":'#/orders/index'},
                {name:"Purchase Order", "link":'#/orders/purchase_order'},
                {name:"Form", "link":''}
            ];
        }
        else{
            bc = [{name:"Orders", "link":''}];
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
        $scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        $scope.toggleMin = function() {
            $scope.minDate = ( $scope.minDate ) ? null : new Date();
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

        $scope.format = 'yyyy-MM-dd';



        //chrome.storage.local.clear();
        //populate order object with data if available in storage

        storageService.get('order_list').then(function(value){
           $scope.load(value);
        });

        $scope.load = function(value){
            if(value != undefined){

                var index = value.length - 1;
                $scope.orders = value[index];
                $scope.orders_index = index;
            }
            else{
                $scope.orders = {};
            }

        }
        //$scope.$watch('stored_data', function(){
            chrome.storage.local.get('order_list', function(storage) {
                $scope.$apply(function() {
                    if (storage) {
                        $scope.stored_data = storage;
                    } else {
                        $scope.stored_data = {};
                    }
                });
            });

        //});
        $scope.data_storage = [];
        //save data when save button is clicked
        $scope.save = function() {
          //check for if we have data stored in local storage
          if($scope.stored_data != undefined){
              $scope.data_storage = $scope.stored_data;
          }

          $scope.orders.synced=0;
          $scope.orders.order_status=0;
          if($scope.orders.uuid == ''){

          }
          $scope.orders.uuid = storageService.uuid;
          $scope.data_storage.push($scope.orders);
          chrome.storage.local.set({'order_list': $scope.data_storage});
        };

  });