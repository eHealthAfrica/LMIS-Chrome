'use strict';

angular.module('lmisChromeApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/main-activity');
    $stateProvider.state('home', {
      url: '',
      abstract: true,
      templateUrl: 'views/home/index.html',
      resolve: {
        currentFacility: function (facilityFactory) {
          return facilityFactory.getCurrentFacility();
        },
        facilityLocation: function (currentFacility, locationsFactory) {
          return locationsFactory.get(currentFacility.location);
        },
        todayStockCount: function (stockCountFactory) {
          var today = new Date();
          return stockCountFactory.getStockCountByDate(today);
        }
      },
      controller: function($scope, currentFacility, facilityLocation, todayStockCount) {
        $scope.facility = currentFacility.name + ' (' +
          facilityLocation.name + ')';
        $scope.hasPendingStockCount = (todayStockCount === null);
      }
    })
    .state('home.index', {
      abstract: true,
      views: {
        'nav': {
          templateUrl: 'views/home/nav.html',
          controller: function ($scope, $state) {
            $scope.$state = $state;
          }
        }
      }
    })
    .state('home.index.mainActivity', {
      url: '/main-activity?stockResult',
      templateUrl: 'views/home/main-activity.html',
      data: {
        label: 'Home'
      },
      controller: function ($stateParams, alertsFactory) {
        if($stateParams.stockResult !== null){
          alertsFactory.success($stateParams.stockResult);
          $stateParams.stockResult = null;
        }
      }
    })
  });
