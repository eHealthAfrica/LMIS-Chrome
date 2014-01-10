'use strict';

angular.module('lmisChromeApp')
  .controller('OrdersctrlCtrl', function ($scope, utility) {
        chrome.storage.local.set({'order_list':[], 'orders_list':[], 'facility':[] });
        //populate order object with data if available in storage
        chrome.storage.local.get('order_list', function(value){
            $scope.$apply(function(){
                $scope.load(value);
            });
        });

        $scope.load = function(value){
            if(value && value.order_list.length > 0){

                var index = value.order_list.length - 1;
                $scope.orders = value.order_list[index];
                $scope.orders_index = index;
            }
            else{
                $scope.orders = {};
            }

        }

        $scope.$watch('stored_data', function(){
            chrome.storage.local.get(null, function(storage) {
                $scope.$apply(function() {
                    if (storage) {
                        $scope.stored_data = storage.order_list;
                    } else {
                        $scope.stored_data = {};
                    }
                });
            });

        });
        $scope.data_storage = [];
        //save data when save button is clicked
        $scope.save = function() {
          //check for if we have data stored in local storage
          if($scope.stored_data.length>0){
              $scope.data_storage = $scope.stored_data;
          }

          $scope.orders.synced=0;
          $scope.orders.order_status=0;
          $scope.orders.uuid = utility.getUUID();
          $scope.data_storage.push($scope.orders);
          chrome.storage.local.set({'order_list': $scope.data_storage});
        };

  });