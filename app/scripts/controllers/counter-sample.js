'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('counterSamples', {
    url: '/counter-samples',
    templateUrl: 'views/counter/counter-sample.html',
    data: {
      label: 'Counter samples'
    },
    controller: function($scope){
      $scope.dropDownCounter = '';

      $scope.textInputCounter = '';

      $scope.numberInputCounter = 0;
    }
  })
});