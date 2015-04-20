angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
    .state('utilization', {
      parent: 'root.index',
      url: 'utilization',
      templateUrl: 'views/utilization/index.html',
      controller: 'UtilizationCtrl'
    })
    .state('utilization-entry', {
      parent: 'root.index',
      url: 'utilization-entry',
      templateUrl: 'views/utilization/form.html',
      controller: 'UtilizationFormCtrl'
    });
  })
  .controller('UtilizationCtrl', function($scope) {

  })
  .controller('UtilizationFormCtrl', function($scope) {

  });
