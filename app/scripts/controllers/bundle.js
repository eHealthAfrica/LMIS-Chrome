'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('incomingLog', {
    url: '/incoming-log',
    templateUrl: '/views/bundles/incoming-log.html',
    controller: 'logIncomingCtrl',
    resolve: {
      bundleNumbers: function (bundleFactory) {
        return bundleFactory.getBundleNumbers();
      },
      currentFacilityStorageUnits: function (storageUnitFactory) {
        return storageUnitFactory.getStorageUnitsByCurrentFacility();
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
    .controller('logIncomingCtrl', function ($scope, $filter, $state, bundleNumbers, storageUnitFactory, $translate,
                                             currentFacilityStorageUnits, bundleFactory, userFactory, alertsFactory) {

      $scope.LOG_STEPS = {ENTER_BUNDLE_NO: 1, BUNDLE_NOT_FOUND: 2, VERIFY: 3, CONFIRM: 4};
      $scope.bundleNumbersAutoCompleteList = bundleNumbers;
      $scope.clicked = false;
      $scope.bundle = {};
      $scope.currentStep = 1;
      $scope.receivingFacilityStorageUnits = currentFacilityStorageUnits;
      $scope.logIncomingForm = {
        dateReceipt: $filter('date')(new Date(), 'yyyy-MM-dd')
      };
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

      userFactory.getLoggedInUser().then(function (data) {
        $scope.loggedInUser = data;
      });

      $scope.getProductType = function (bundleLine) {
        return bundleLine.batch.product;
      }

      $scope.getQuantityDetail = function (quantity, uom) {
        return $filter('number')(quantity, 0) + ' ' + uom.symbol;
      }

      /**
       * function that shows form used to log incoming bundle if it already exists in the system.
       */
      $scope.showBundle = function () {

        if ($scope.show === true && $scope.showPreview === true) {
          $scope.showPreview = false;
          $scope.currentStep = $scope.LOG_STEPS.VERIFY;
          return;
        }

        $scope.clicked = true;
        bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
          $scope.bundle = data;
          $scope.show = true;
          $scope.currentStep = $scope.LOG_STEPS.VERIFY;
          $scope.showAddManually = false;
          return;
        }, function (error) {
          $scope.currentStep = $scope.LOG_STEPS.BUNDLE_NOT_FOUND;
          $scope.showAddManually = true;
        });
      };

      /**
       * Function used to hide form used to log incoming bundle form.
       */
      $scope.hideBundle = function () {
        $scope.currentStep = $scope.LOG_STEPS.ENTER_BUNDLE_NO;
        $scope.clicked = false;
        $scope.show = false;
        $scope.showAddManually = false;
      };

      /**
       * shows preview page after entering incoming bundle details. validations and display of error message takes place
       * here.
       */
      $scope.previewLogBundleForm = function () {
        //TODO: add validations when they have been defined
        $scope.currentStep = $scope.LOG_STEPS.CONFIRM;
        $scope.showPreview = true;
      };


      /**
       * Function called when confirm button is clicked and it saves the bundle info, to generate bundle receipt.
       */
      $scope.confirm = function () {
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
          "date_receipt":  $scope.logIncomingForm.dateReceipt,
          "bundle_receipt_lines": bundleReceiptLines,
          "receiving_facility": $scope.bundle.receiving_facility.uuid,
          "sending_facility": $scope.bundle.parent.uuid
        };

        bundleFactory.saveBundleReceipt(bundleReceipt).then(function (data) {
          if (data.length !== 0) {
            $translate('logIncomingSuccessMessage').then(function (msg) {
              $state.go('home.index.dashboard.chart', {logIncomingMsg: msg});
            });
          }
        }, function (error) {
          alertsFactory.danger(error);
          console.log(error);
        });

      };
    });

