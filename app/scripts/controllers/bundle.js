'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.config(function ($stateProvider) {
  $stateProvider
      .state('incomingLog', {
        url: '/incoming-log',
        templateUrl: '/views/bundles/incoming-log.html',
        controller: 'logIncomingCtrl'
      });
});

/**
 * LogIncomingCtrl for logging incoming bundle and updating inventory batch list view, bundle status, generates and stores
 * Bundle Receipt.
 */
chromeApp.controller('logIncomingCtrl', function ($scope, $filter, storageService, bundleFactory, userFactory,
                                                  programsFactory, facilityFactory, productTypeFactory) {

  productTypeFactory.getAll();

  $scope.found = false;
  $scope.clicked = false;
  $scope.bundle = {};
  $scope.bundle.date = '';
  $scope.getFacilityStorageUnits = [];
  $scope.getBundleProgram = programsFactory.getProgram;
  $scope.getBatch = bundleFactory.getBatch;
  $scope.getUOM = bundleFactory.getQuantityUOM
  $scope.getProductType = bundleFactory.getProductType;
  $scope.logIncomingForm = {};
  $scope.logIncomingForm.verify = [];
  $scope.logIncomingForm.storage_units = [];


  $scope.getCurrentDate = function () {
    var today = new Date();
    return $filter('date')(today, "yyyy-MM-dd");
  }

  userFactory.getLoggedInUser().then(function (data) {
    $scope.loggedInUser = data;
  });

  $scope.getUOMDetail = function (bundleLine) {
    return $filter('number')(bundleLine.quantity, 0) + ' ' + $scope.getUOM(bundleLine).symbol;
  }


  /**
   * function that shows form used to log incoming bundle if it already exists in the system.
   */
  $scope.showBundle = function () {


    $scope.clicked = true;
    bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
      if (data !== undefined) {
        $scope.bundle = data;
        $scope.bundle.date = $scope.getCurrentDate();
        var receivingFacility = $scope.bundle.receiving_facility;
        $scope.parent = $scope.bundle.parent.name;
        $scope.receiving_facility = receivingFacility.name;
        $scope.receivingFacilityStorageUnits = facilityFactory.getFacilityStorageUnits(receivingFacility.uuid);
        $scope.show = true;
        $scope.found = true;
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
  };


  /**
   * Function called when authorize button is clicked and it saves the bundle info, to generate bundle receipt.
   */
  $scope.authorize = function () {

    var bundleReceiptLines = [];
    for (var index in $scope.bundle.bundle_lines) {
      var bundleLine = $scope.bundle.bundle_lines[index];
      var bundleReceiptLine = {
        "bundle_line_uuid": bundleLine.uuid,
        "verify": $scope.logIncomingForm.verify[bundleLine.uuid],
        "storage_unit": $scope.logIncomingForm.storage_units[bundleLine.uuid]
      }
      bundleReceiptLines.push(bundleReceiptLine);
    }

    var bundleReceipt = {
      "bundle": $scope.bundle.uuid,
      "user": $scope.loggedInUser.id,
      "date": $scope.bundle.date,
      "bundle_receipt_lines": bundleReceiptLines
    };
    var bundleReceiptUUID = bundleFactory.saveBundleReceipt(bundleReceipt);
    if (bundleReceiptUUID !== undefined) {
      //update inventory
      return;
    }
    //display error message insertion failed.
  }
});

