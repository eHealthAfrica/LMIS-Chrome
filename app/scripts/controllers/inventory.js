'use strict';
var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('InventoryCtrl', function ($scope, $location, storageService) {



  });

chromeApp.controller("StockRecordsCtrl",function($scope, $location, storageService, $http, $filter){
    $scope.facility_uuid = ($location.search()).facility;
    $scope.report_month = ($location.search()).report_month;
    $scope.report_year = ($location.search()).report_year;

    $scope.user_related_facilities=[];
    $scope.fake_locations = [];
    $scope.user_related_facility= ($scope.facility_uuid != undefined)?$scope.facility_uuid:'';
    $scope.report_month= ($scope.report_month != undefined)?$scope.report_month:'';
    $scope.report_year= ($scope.report_year != undefined)?$scope.report_year:'';

    var file_url = 'scripts/fixtures/user_related_facilities.json';
    $http.get(file_url).success(function(data){
        $scope.user_related_facilities =data;

    });

    $scope.add_button = true;
    $scope.$watchCollection('[report_month, report_year, user_related_facility]', function(newvalues){
        console.log(newvalues);
        if(newvalues[0]=='' || newvalues[1] == '' || newvalues[2] == ''){
            $scope.add_button = true;
        }
        else{
            $scope.add_button = false;
        }

    });
    $scope.$watch('add_button', function(newvalue){
        console.log($scope.add_button);
    });


    $scope.$watch('user_related_facility',function(){
        if($scope.user_related_facility != ''){
            var file_url2 = 'scripts/fixtures/locations.json';
            $http.get(file_url2).success(function(data){
                for(var k in $scope.user_related_facilities){
                    if($scope.user_related_facilities[k].uuid == $scope.user_related_facility){
                        $scope.ward =data[$scope.user_related_facilities[k].location].name;
                        $scope.lga =data[$scope.user_related_facilities[k].location].lga;
                        $scope.state =data[$scope.user_related_facilities[k].location].state;
                        break;
                    }
                }


            });
        }

    });

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
    $scope.facility_uuid = ($location.search()).facility;
    $scope.report_month = ($location.search()).report_month;
    $scope.report_year = ($location.search()).report_year;

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

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $scope.facility_programs =
    {
        "902aef31-051d-4a83-9017-6ac9710b5bb5":{
            program:"39a07d76-9d4b-4c9e-b50b-bba827d08f74"
        }
        ,
        "d48a39fb-6d37-4472-9983-bc0720403719":{
            program:"edc769e2-b26e-40e0-9b58-b59785cf50f7"
        }
    }

    $scope.stock_records.program = $scope.facility_programs[$scope.facility_uuid].program;

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


