'use strict';

angular.module('lmisChromeApp')
  .controller('FooterCtrl', function($scope, $window) {
    var manifest = $window.chrome.runtime.getManifest();

    $scope.now = new Date();
    $scope.version = manifest.version;
  });
