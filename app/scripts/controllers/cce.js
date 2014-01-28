'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('cceCtrl', function ($scope, storageService, utility, $filter, ngTableParams) {

  //constants used to track CCE status
  $scope.CCE_WORKING = 0;
  $scope.NOT_WORKING = 1;
  $scope.CCE_IN_REPAIR = 2;

  storageService.get(storageService.STORAGE_LOCATION).then(function (data) {
    // Table defaults
    var params = {
      page: 1,
      count: 10,
      sorting: {
        code: 'asc'     // initial sorting
      }
    };

    // Pagination
    var resolver = {
      total: data.length,
      getData: function ($defer, params) {
        var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
        $defer.resolve(orderedData.slice(
            (params.page() - 1) * params.count(),
            params.page() * params.count()
        ));
      }
    }

    $scope.cceList = new ngTableParams(params, resolver);
  });

  utility.loadTableObject(storageService.FACILITY).then(function (facilities) {
    $scope.facilities = facilities;
  });

  utility.loadTableObject(storageService.STORAGE_LOCATION_TYPE).then(function (cceTypes) {
    $scope.cceTypes = cceTypes;
  });

  utility.loadTableObject(storageService.UOM).then(function (uomList) {
    $scope.uomList = uomList;
  });

  utility.loadTableObject(storageService.STORAGE_LOCATION).then(function (cceList) {
    $scope.parentCCEList = cceList;
  });

  $scope.selectedTempCCE = '';
  console.log($scope.selectedTempCCE);
});


/**
 *  This controller is used to save CCE record to local storage or remote DB via REST API.
 */
chromeApp.controller('addCCECtrl', function ($scope, storageService) {

  //default cce to hold form data
  $scope.cce = {}

  storageService.get(storageService.UOM).then(function (uomList) {
    $scope.uomList = uomList;
  });

  storageService.get(storageService.FACILITY).then(function (facilities) {
    $scope.facilities = facilities;
  });

  storageService.get(storageService.STORAGE_LOCATION).then(function (cceList) {
    $scope.cceList = cceList;
  });


});

/**
 *  This controller will pull logged in user facility CCE problem logs
 */
chromeApp.controller('cceProblemLogMainCtrl', function ($scope, storageService, utility) {

  storageService.get(storageService.STORAGE_LOCATION_PROBLEM).then(function (data) {
    $scope.cceProblems = data;
  });

  utility.loadTableObject(storageService.STORAGE_LOCATION).then(function (data) {
    $scope.cceList = data;
  });

  utility.loadTableObject(storageService.FACILITY).then(function (data) {
    $scope.facilities = data;
  });

  utility.loadTableObject(storageService.CURRENCY).then(function (data) {
    $scope.currency = data;
  });

  utility.loadTableObject(storageService.USER).then(function (data) {
    $scope.users = data;
  });

  $scope.getUser = function(userObj) {
    if(userObj){
      return userObj.username;
    }
    return '';
  };

});