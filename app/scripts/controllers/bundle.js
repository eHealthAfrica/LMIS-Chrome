'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.config(function ($stateProvider) {
  $stateProvider
      .state('incomingLog', {
        url: '/incoming-log',
        templateUrl: '/views/bundles/incominglog.html',
        controller: function ($scope, storageService, bundleFactory) {
          $scope.found = false;
          $scope.clicked = false;
          $scope.bundle = null;

          /**
           * function that shows form used to log incoming bundle if it already exists in the system.
           */
          $scope.showBundle = function () {
            $scope.clicked = true;
            bundleFactory.getBundle($scope.showBundleNo).then(function (data) {
              if (data !== undefined) {
                $scope.bundle = data;
                $scope.parent = $scope.bundle.parent.name;
                $scope.receiving_facility = $scope.bundle.receiving_facility.name;
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
          }
        }
      });
});

