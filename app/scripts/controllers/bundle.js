'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.config(function ($stateProvider) {
  $stateProvider
      .state('incomingLog', {
        url: '/incoming-log',
        templateUrl: '/views/bundles/incominglog.html',
        controller: function ($scope, $filter, storageService, bundleFactory, userFactory, programsFactory, facilityFactory) {



          $scope.found = false;
          $scope.clicked = false;
          $scope.bundle = {};
          $scope.lines = [];
          $scope.bundle.date = '';
          $scope.getFacilityStorageUnits = [];
          $scope.getBundleProgram = programsFactory.getProgram;
          $scope.getBatch = bundleFactory.getBatch;
          $scope.getUOM = bundleFactory.getQuantityUOM
          $scope.getProductType = bundleFactory.getProductType;
          $scope.lines = {};
          $scope.verify = {};
          $scope.bundleLineReceipts = [];

          $scope.getCurrentDate = function () {
            var today = new Date();
            return $filter('date')(today, "yyyy-MM-dd");
          }

          userFactory.getLoggedInUser().then(function (data) {
            $scope.loggedInUser = data;
          });

          $scope.getBundleReceiptLines = function () {
            for (var index in $scope.lines) {
              console.log(index);
            }
          };

          /**
           * function that shows form used to log incoming bundle if it already exists in the system.
           */
          $scope.showBundle = function () {
            $scope.clicked = true;
            bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
              if (data !== undefined) {
                //$scope.bundleLineReceipts =  [{'verify': 0}, {'verify': 3}];
                $scope.bundle = data;
                $scope.lines = $scope.bundle.bundleLines;
                console.log($scope.lines);
                console.log($scope.lines.pop());
                for (var index in $scope.lines) {
                  console.log($scope.lines[index]);

                }


                $scope.bundle.date = $scope.getCurrentDate();
                var receivingFacility = $scope.bundle.receiving_facility;
                $scope.parent = $scope.bundle.parent.name;
                $scope.receiving_facility = receivingFacility.name;
                $scope.show = true;
                $scope.found = true;

                $scope.receivingFacilityStorageUnits = facilityFactory.getFacilityStorageUnits(receivingFacility.uuid)


                $scope.getBundleReceiptLines();
                return;
              }
              $scope.found = false;
            });

          };


          /**
           * Function used to hide form used to log incoming bundle form.
           */
          $scope.hideBundle = function () {
            $scope.found = false;
            $scope.clicked = false;
            $scope.show = false;
          }


          $scope.authorize = function () {

            $scope.logIncomingForm = {
              "bundle": $scope.bundle.uuid,
              "user": $scope.loggedInUser.id,
              "date": $scope.bundle.date,
              "bundle_receipt_lines": []
            };
//             for(var index in $scope.bundle.bundleLines){
//              console.log($scope.bundle.bundleLines[index]);
//
//            }
            console.log($scope.bundleLineReceipts[$scope.bundle.bundleLines[index].uuid].verify);
            bundleFactory.saveBundleReceipt($scope.logIncomingForm);
          }

        }

      });
});

