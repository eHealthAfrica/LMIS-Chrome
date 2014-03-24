'use strict';
// jshint camelcase: false

angular.module('lmisChromeApp')
  .controller('FacilitiesCtrl', function($scope, storageService) {

    storageService.get(storageService.FACILITY).then(function(data) {
      $scope.facilities = data;
    });

       storageService.get(storageService.USER).then(function(data) {
      $scope.users = data;
    });

    storageService.loadTableObject(storageService.FACILITY_TYPE).then(function(data) {
      $scope.facility_types = data;
    });

  });
