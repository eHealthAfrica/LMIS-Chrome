'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('cceCtrl', function ($scope, storageService, utility, ngTableParams) {

    //constants used to track CCE status
    $scope.CCE_WORKING = 0;
    $scope.NOT_WORKING = 1;
    $scope.CCE_IN_REPAIR = 2;

    storageService.get(storageService.STORAGE_LOCATION).then(function(data) {
      // Table defaults
      var params = {
        page: 1,
        count: 10
      };

      // Pagination
      var resolver = {
        total: data.length,
        getData: function($defer, params) {
          $defer.resolve(data.slice(
            (params.page() - 1) * params.count(),
            params.page() * params.count()
          ));
        }
      }

      $scope.cceList = new ngTableParams(params, resolver);
    });

    utility.loadTableObject(storageService.FACILITY).then(function(facilities) {
      $scope.facilities = facilities;
    });

    utility.loadTableObject(storageService.STORAGE_LOCATION_TYPE).then(function(cceTypes) {
      $scope.cceTypes = cceTypes;
    });

    utility.loadTableObject(storageService.UOM).then(function(uomList) {
      $scope.uomList = uomList;
    });

    utility.loadTableObject(storageService.STORAGE_LOCATION).then(function(cceList) {
      $scope.parentCCEList = cceList;
    });

    $scope.selectedTempCCE  = '';
    console.log($scope.selectedTempCCE);
});


/**
 *  This controller is used to save CCE record to local storage or remote DB via REST API.
 *
 */
chromeApp.controller('addCCECtrl', function($scope, storageService){
    //default cce to hold form data
    $scope.cce = {}

    storageService.get(storageService.UOM).then(function(uomList) {
      $scope.uomList = uomList;
    });

    storageService.get(storageService.FACILITY).then(function(facilities) {
      $scope.facilities = facilities;
    });

    storageService.get(storageService.STORAGE_LOCATION).then(function(cceList) {
      $scope.cceList = cceList;
    });


});