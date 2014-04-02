'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfigWelcome', {
    url: '/app-config-welcome',
    parent: 'root.index',
    templateUrl: '/views/app-config/welcome-page.html',
    data: {
      label: 'Welcome'
    }
  }).state('appConfigWizard', {
    url: '/app-config-wizard',
    parent: 'root.index',
    templateUrl: '/views/app-config/wizard/initial-config.html',
    resolve: {
      facilities: function(facilityFactory){
        return facilityFactory.getAll();
      },
      productProfiles: function(productProfileFactory){
        return productProfileFactory.getAll();
      },
      save: function(){

      }
    },
    controller: 'AppConfigWizard',
    data: {
      label: 'Configuration wizard'
    }
  }).state('editAppConfig', {
    url: '/edit-app-config',
    parent: 'root.index',
    templateUrl: '/views/app-config/configuration.html',
    resolve: {
      facilities: function(facilityFactory){
        return facilityFactory.getAll();
      },
      productProfiles: function(productProfileFactory){
        return productProfileFactory.getAll();
      },
      appConfig: function(appConfigService){
        return appConfigService.load();
      }
    },
    controller: 'EditAppConfigCtrl',
    data: {
      label: 'Settings'
    }
  })

}).controller('AppConfigWizard', function($scope, facilities, productProfiles, appConfigService, alertsFactory, $state){
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.STEP_ONE = 1, $scope.STEP_TWO = 2, $scope.STEP_THREE = 3;
  $scope.facilities = facilities;
  $scope.productProfiles = productProfiles;
  $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
  $scope.currentStep = $scope.STEP_ONE; //set initial step
  $scope.moveTo = function(step){
    $scope.currentStep = step;
  };

  $scope.appConfig = appConfigService.appConfigModel;

  $scope.handleSelectionEvent = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.handleSelectionEvent(productProfile, $scope.appConfig.selectedProductProfiles);
  };

  $scope.intervalError = 'select stock count interval.';

  $scope.save = function(){
    //TODO: refactor this into common function that controllers can share. or call createApp config here.
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

}).controller('EditAppConfigCtrl', function ($scope, facilities, productProfiles, appConfigService, alertsFactory, $log,
                                         i18n, $state, appConfig) {
 $scope.stockCountIntervals = appConfigService.stockCountIntervals;
 $scope.facilities = facilities;
 $scope.productProfiles = productProfiles;
 $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
 $scope.preSelectProductProfileCheckBox = {};
 $scope.isSubmitted = false;
 //used to hold config form data
 $scope.appConfig = appConfigService.appConfigModel;

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
   }else{
     //take to app welcome page for initial setup
     $state.go('appConfigWelcome');
   }
 };
 preLoadConfigForm(appConfig);//pre-load config form with existing app config.

 $scope.handleSelectionEvent = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.handleSelectionEvent(productProfile, $scope.appConfig.selectedProductProfiles);
 };

 $scope.save = function(){
   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility)
   appConfigService.setup($scope.appConfig)
    .then(function (result) {
      if(result !== undefined){
        $state.go('home.index.mainActivity',{'appConfigResult': i18n('appConfigSuccessMsg') });
      } else {
        alertsFactory.danger(i18n('appConfigFailedMsg'));
      }
   }, function (reason) {
      alertsFactory.danger(i18n('appConfigFailedMsg'));
      $log.error(reason);
   });
 };
});
