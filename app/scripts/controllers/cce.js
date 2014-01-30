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
chromeApp.controller('cceProblemLogMainCtrl', function ($scope, storageService, utility, $filter, ngTableParams) {

  storageService.get(storageService.STORAGE_LOCATION_PROBLEM).then(function (data) {
    // Table defaults
    var params = {
      page: 1,
      count: 10
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

    $scope.cceProblems = new ngTableParams(params, resolver);

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

  $scope.getUser = function (userObj) {
    if (userObj) {
      return userObj.username;
    }
    return '';
  };

});

/**
 * AddProblemLogCtrl is used for adding problems logs to a selected Cold Chain Equipment.
 */
chromeApp.controller('AddProblemLogCtrl', function ($scope, storageService) {

  //default problem log used to hold problem log form data
  $scope.problemLog = {};

  //this function will be used to save Add CCE problem log form content to local storage
  $scope.save = function () {
    console.log($scope.problemLog);
  };

  storageService.get(storageService.STORAGE_LOCATION).then(function (cceList) {
    $scope.cceList = cceList;
  });

  storageService.get(storageService.CURRENCY).then(function (currency) {
    $scope.currencies = currency;
  });
});


/**
 * This is the controller for the main temperature log view
 */
chromeApp.controller('cceTemperatureLogMainCtrl', function ($scope, storageService, $filter, ngTableParams, utility) {

  storageService.get(storageService.STORAGE_LOCATION_TEMPERATURE).then(function (data) {

    // Table defaults
    var params = {
      page: 1,
      count: 10
    };

    // Pagination and sorting
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

    $scope.temperatureLogs = new ngTableParams(params, resolver);

    $scope.getUser = function (userObj) {
      if (userObj) {
        return userObj.username;
      }
      return '';
    };

    utility.loadTableObject(storageService.STORAGE_LOCATION).then(function (data) {
      $scope.cceList = data;
    });

    utility.loadTableObject(storageService.UOM).then(function (uomList) {
      $scope.uomList = uomList;
    });

  });
});

/**
 * This Controller is used by AddTemperatureLog Form.
 */
chromeApp.controller('AddTemperatureLogCtrl', function ($scope, storageService, utility) {

  //default temperatureLog object used to hold temp log form data
  $scope.temperatureLog = {}

  storageService.get(storageService.STORAGE_LOCATION).then(function (cceList) {
    $scope.cceList = cceList;
  });

  storageService.get(storageService.UOM).then(function (data) {
    $scope.uomList = data;
  });

  $scope.save = function () {
    console.log($scope.temperatureLog)
  }
});


chromeApp.controller('cceTemperatureChartCtrl', function ($scope, storageService) {
  storageService.get(storageService.STORAGE_LOCATION).then(function (cceList) {
    $scope.cceList = cceList;
  });

});