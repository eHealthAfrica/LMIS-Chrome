'use strict';

angular.module('lmisChromeApp')
  .controller('BreadcrumbsCtrl', function($scope, $state) {
    $scope.state = $state;
  });
