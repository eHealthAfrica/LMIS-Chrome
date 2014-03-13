'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('incomingLog', {
    url: '/incoming-log',
    templateUrl: '/views/bundles/incoming-log.html',
    controller: 'logIncomingCtrl',
    resolve: {
      bundleNumbers: function (bundleFactory) {
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

      $scope.bundleNumbersAutoCompleteList = bundleNumbers;
      $scope.clicked = false;
      $scope.bundle = {};
      $scope.date_receipt = new Date();
      $scope.getFacilityStorageUnits = [];
      $scope.logIncomingForm = {};
      $scope.logIncomingForm.verify = [];
      $scope.logIncomingForm.storage_units = [];
      /**
       * this is used to return storage unit object at preview page based on the uuid.
       * */
      $scope.getStorageUnit = function (storageUnitUUID) {
        for (var index in $scope.receivingFacilityStorageUnits) {
          var storageUnit = $scope.receivingFacilityStorageUnits[index];
          if (storageUnit.uuid === storageUnitUUID) return storageUnit;
        }
        return {};
      };

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

        if ($scope.show === true && $scope.showPreview === true) {
          $scope.showPreview = false;
          return;
        }

        $scope.clicked = true;
        bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
          $scope.bundle = data;
          storageUnitFactory.getFacilityStorageUnits($scope.bundle.receiving_facility.uuid).then(function (data) {
            $scope.receivingFacilityStorageUnits = data;
          });
          $scope.show = true;
          $scope.showAddManually = false;
          return;
        }, function () {
          var errorMsg;
          $translate('bundleNotFound', {id: $scope.showBundleNo})
              .then(function (msg) {
                errorMsg = msg;
                $scope.showAddManually = true;
              });
          $scope.bundleNoErrorMsg = errorMsg;
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
      $scope.previewLogBundleForm = function () {
        console.log("here");
        $scope.showPreview = true;
      };


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
          "date_receipt": $scope.date_receipt.toISOString(),
          "bundle_receipt_lines": bundleReceiptLines,
          "receiving_facility": $scope.bundle.receiving_facility.uuid,
          "sending_facility": $scope.bundle.parent.uuid
        };

        bundleFactory.saveBundleReceipt(bundleReceipt).then(function (data) {
          if (data.length !== 0) {
            $state.go('home.index.dashboard', {logSucceeded: true});
          }
        }, function (error) {
          alertsFactory.add({message: error, type: 'danger'});
          console.log(error);
        });

      };
    });

