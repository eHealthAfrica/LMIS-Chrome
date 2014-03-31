'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfig', {
    url: '/app-config',
    parent: 'root.index',
    templateUrl: '/views/app-config/configuration.html',
    resolve: {
      appConfig: function(appConfigService){
        return appConfigService.load();
      },
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
}).controller('AppConfigCtrl', function ($scope, facilities, productProfiles, appConfigService, alertsFactory, $log, i18n, $state, appConfig) {

 $scope.isFirstConfiguration = (appConfig === undefined)? true : false;
 $scope.stockCountIntervals = appConfigService.stockCountIntervals;
 $scope.facilities = facilities;
 $scope.productProfiles = productProfiles;
 $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
 $scope.preSelectProductProfileCheckBox = {};
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

 function preLoadConfigForm(appConfig){
   if (appConfig !== undefined) {
     $scope.appConfig.contactPerson = appConfig.contactPerson;
     $scope.appConfig.stockCountInterval = parseInt(appConfig.stockCountInterval);
     $scope.appConfig.facility = appConfig.facility;
     $scope.appConfig.appFacility = appConfig.appFacility;
     $scope.appConfig.selectedProductProfiles = appConfig.selectedProductProfiles;
     for (var index in appConfig.selectedProductProfiles) {
       var selectedProductProfile = appConfig.selectedProductProfiles[index];
       $scope.preSelectProductProfileCheckBox[selectedProductProfile.uuid] = selectedProductProfile;
     }
   }
 };
 preLoadConfigForm(appConfig);//pre-load config form with previous saved values.

 function removeSelectedProductProfile(productProfile){
  $scope.appConfig.selectedProductProfiles = $scope.appConfig.selectedProductProfiles
    .filter(function (prodProf) {
      return prodProf.uuid !== productProfile.uuid;
  });
 }

 $scope.handleSelectionEvent = function(selection){
   var productProfile = JSON.parse(selection);
   if(productProfile.deSelected === undefined){
     $scope.appConfig.selectedProductProfiles.push(productProfile);
     return;
   }
   removeSelectedProductProfile(productProfile);
 };

 $scope.save = function(){
   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility)
   appConfigService.setup($scope.appConfig)
    .then(function (result) {
      if(result !== undefined){
        var msg = 'Application configuration was successful!!!';
        $state.go('home.index.mainActivity',{'appConfigResult': msg });
      } else {
        alertsFactory.danger(i18n('appConfigFailedMsg'));
      }
   }, function (reason) {
      alertsFactory.danger(i18n('appConfigFailedMsg'));
      $log.error(reason);
   });
 };
});
