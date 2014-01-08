'use strict';

angular.module('lmisChromeApp')
  .controller('OrdersctrlCtrl', function ($scope) {
         //chrome.storage.local.set({'order_list':'' });
        //populate order object with data if available in storage
        chrome.storage.local.get('order_list', function(value){
            $scope.$apply(function(){
                $scope.load(value);
            });
        });

        $scope.load = function(value){
            if(value && value.order_list){
                $scope.orders = value.order_list;
            }
            else{
                $scope.orders = {};
            }

        }
        //save data when save button is clicked
        $scope.save = function() {

          chrome.storage.local.set({'order_list':$scope.orders });
        };

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


  });