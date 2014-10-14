'use strict';

angular.module('lomis.root')
  .controller('BreadcrumbsCtrl', function($scope, $state) {
    $scope.state = $state;
  });
