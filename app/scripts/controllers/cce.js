'use strict';

var chromeApp = angular.module('lmisChromeApp');

chromeApp.controller('cceCtrl', function ($scope, $location) {

});


/**
 *  This controller is used to save CCE record to local storage or remote DB via REST API.
 *
 */
chromeApp.controller('addCCECtrl', function($scope){
    //default cce to hold form data
    $scope.cce = {}

});