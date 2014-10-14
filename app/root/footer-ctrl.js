'use strict';

angular.module('lomis.root')
  .controller('FooterCtrl', function($scope, $window) {
    var manifest = $window.chrome.runtime.getManifest();
    $scope.year = new Date().getFullYear();
    $scope.version = manifest.version;
  });
