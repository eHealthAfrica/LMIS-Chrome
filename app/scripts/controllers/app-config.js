'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfig', {
    url: '/app-config',
    templateUrl: '/views/app-config/configuration.html',
    resolve: {
      facilities: function (facilityFactory) {
        return facilityFactory.getAll();
      }
    },
    controller: 'AppConfigCtrl',
    data: {
      label: "App Configuration"
    }
  })
}).controller('AppConfigCtrl', function ($scope, facilities, appConfigService) {
      $scope.stockCountIntervals = appConfigService.stockCountIntervals;
      $scope.facilities = facilities;
      $scope.appConfig = {};//used to hold config form data
});