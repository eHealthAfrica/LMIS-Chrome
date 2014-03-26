'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfig', {
    url: '/app-config',
    templateUrl: '/views/app-config/configuration.html',
    resolve: {
      facilities: function (facilityFactory) {
        return facilityFactory.getAll();
      },
      productProfiles: function(productProfileFactory){
        return productProfileFactory.getAll();
      }
    },
    controller: 'AppConfigCtrl',
    data: {
      label: 'App Configuration'
    }
  })
}).controller('AppConfigCtrl', function ($scope, facilities, productProfiles, appConfigService) {
 $scope.stockCountIntervals = appConfigService.stockCountIntervals;
 $scope.facilities = facilities;
 //used to hold config form data
 $scope.appConfig = {
   facility: '',
   stockCountInterval: '',
   contactPerson: {
     name: '',
     email: '',
     phoneNo: ''
   },
   selectedProductProfiles: []
 };
 $scope.productProfileCheckBoxes = [];
 $scope.productProfiles = productProfiles;

 $scope.handleSelectionEvent = function(selection){
   var productProfile = JSON.parse(selection);
   if(productProfile.deSelected === undefined){
     $scope.appConfig.selectedProductProfiles.push(productProfile);
     return;
   }
   $scope.appConfig.selectedProductProfiles = $scope.appConfig.selectedProductProfiles
    .filter(function (prodProf) {
      return prodProf.uuid !== productProfile.uuid;
   });
 };

 $scope.save = function(){
   console.log($scope.appConfig);
 };
});