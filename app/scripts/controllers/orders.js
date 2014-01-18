'use strict';

angular.module('lmisChromeApp')
  .controller('OrdersctrlCtrl', function ($scope, utility, ChromeStorageService) {
        $scope.codec = "linka";
        //chrome.storage.local.clear();
        //populate order object with data if available in storage

        ChromeStorageService.get('order_list').then(function(value){
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
          $scope.orders.uuid = utility.getUUID();
          $scope.data_storage.push($scope.orders);
          chrome.storage.local.set({'order_list': $scope.data_storage});
        };

  });