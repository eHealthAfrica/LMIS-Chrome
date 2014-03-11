'use strict';

angular.module('lmisChromeApp')
    .config(function ($stateProvider) {
      $stateProvider
          .state('incomingLog', {
            url: '/incoming-log',
            templateUrl: '/views/bundles/incoming-log.html',
            controller: 'logIncomingCtrl',
            resolve: {
              bundleNumbers: function(bundleFactory){
                return bundleFactory.getBundleNumbers();
              }
            },
            data: {
              label: 'Log Incoming'
            }
          });
    })

/**
 * LogIncomingCtrl for logging incoming bundle and updating inventory batch list view, bundle status, generates and stores
 * Bundle Receipt.
 */
    .controller('logIncomingCtrl', function ($scope, $filter, $state, bundleNumbers, storageUnitFactory, bundleFactory, userFactory, alertsFactory, $translate) {

      function getCurrentDate() {
        var today = new Date();
        return $filter('date')(today, "yyyy-MM-dd");
      }

      $scope.bundleNumbers = bundleNumbers;

      $scope.clicked = false;
      $scope.bundle = {};
      $scope.bundle.date = getCurrentDate();
      $scope.getFacilityStorageUnits = [];
      $scope.logIncomingForm = {};
      $scope.logIncomingForm.verify = [];
      $scope.logIncomingForm.storage_units = [];



      $scope.addNewInventory = function (bundleNumber) {
        $state.go('addInventory', {bundleNo: bundleNumber});
      }

      userFactory.getLoggedInUser().then(function (data) {
        $scope.loggedInUser = data;
      });

      $scope.getProductType = function (bundleLine) {
        return bundleLine.batch.product;
      }

      $scope.getUOMDetail = function (bundleLine) {
        return $filter('number')(bundleLine.quantity, 0) + ' ' + bundleLine.quantity_uom.symbol;
      }

      /**
       * function that shows form used to log incoming bundle if it already exists in the system.
       */
      $scope.showBundle = function () {

        $scope.add = function (bundleLine) {
          bundleLine.verify = isNaN(bundleLine.verify) ? 1 : (parseInt(bundleLine.verify) + 1);
        };

        $scope.subtract = function (bundleLine) {
          bundleLine.verify = (isNaN(bundleLine.verify) || (bundleLine.verify <= 0))
              ? 0 : (parseInt(bundleLine.verify) - 1);
        };

        $scope.clicked = true;
        bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
          $scope.bundle = data;
          //$scope.bundle.date = $scope.getCurrentDate();
          var receivingFacility = $scope.bundle.receiving_facility;
          $scope.parent = $scope.bundle.parent.name;
          $scope.receiving_facility = receivingFacility.name;
          storageUnitFactory.getFacilityStorageUnits(receivingFacility.uuid).then(function (data) {
            $scope.receivingFacilityStorageUnits = data;
          });
          $scope.show = true;
          $scope.showAddManually = false;
          return;
        }, function () {
          $translate('bundleNotFound', {id: $scope.showBundleNo})
              .then(function (msg) {
                alertsFactory.add({message: msg, type: 'danger'});
                $scope.showAddManually = true;
              });
        });
      };


      /**
       * Function used to hide form used to log incoming bundle form.
       */
      $scope.hideBundle = function () {
        $scope.clicked = false;
        $scope.show = false;
        $scope.showAddManually = false;
      };

      /**
       * shows preview page after entering incoming bundle details. validations and display of error message takes place
       * here.
       */
      $scope.previewLogBundleForm = function(){
        $scope.showPreview = true;
      }


      /**
       * Function called when authorize button is clicked and it saves the bundle info, to generate bundle receipt.
       */
      $scope.save = function () {

        var bundleReceiptLines = [];
        for (var index in $scope.bundle.bundle_lines) {
          var bundleLine = $scope.bundle.bundle_lines[index];
          var bundleReceiptLine = {
            "bundle_line_uuid": bundleLine.uuid,
            "verify": $scope.logIncomingForm.verify[bundleLine.uuid],
            "storage_unit": $scope.logIncomingForm.storage_units[bundleLine.uuid],
            "batch": bundleLine.batch.batch_no,
            "program": bundleLine.program.uuid,
            "quantity_uom": bundleLine.quantity_uom.uuid,
            "quantity": bundleLine.quantity
          }
          bundleReceiptLines.push(bundleReceiptLine);
        }


        var bundleReceipt = {
          "bundle": $scope.bundle.uuid,
          "user": $scope.loggedInUser.id,
          "date": $scope.bundle.date,
          "bundle_receipt_lines": bundleReceiptLines,
          "receiving_facility": $scope.bundle.receiving_facility.uuid,
          "sending_facility": $scope.bundle.parent.uuid
        };

        bundleFactory.saveBundleReceipt(bundleReceipt).then(function (data) {
          if (data.length !== 0) {
            $state.go('inventoryListView', {add: true});
          }

        }, function (error) {
          console.log(error);
        });


      }
    });

