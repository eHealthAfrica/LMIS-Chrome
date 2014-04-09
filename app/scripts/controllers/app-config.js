'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfig', {
    parent: 'root.index',
    abstract: true,
    templateUrl: 'views/home/index.html'
  }).state('appConfigWelcome', {
    url: '/app-config-welcome',
    parent: 'root.index',
    templateUrl: '/views/app-config/welcome-page.html',
    data: {
      label: 'Welcome'
    }
  }).state('appConfig.wizard', {
    url: '/app-config-wizard',
    parent: 'root.index',
    templateUrl: '/views/app-config/wizard.html',
    resolve: {
      facilities: function(facilityFactory){
        return facilityFactory.getAll();
      },
      productProfiles: function(productProfileFactory){
        return productProfileFactory.getAll();
      }
    },
    controller: 'AppConfigWizard',
    data: {
      label: 'Configuration wizard'
    }
  }).state('appConfig.edit', {
    url: '/edit-app-config',
    parent: 'root.index',
    templateUrl: '/views/app-config/edit-configuration.html',
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

}).controller('AppConfigWizard', function($scope, facilities, productProfiles, appConfigService, alertsFactory, $state,
        i18n){
  $scope.isSubmitted = false;
  $scope.preSelectProductProfileCheckBox = {};
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.STEP_ONE = 1, $scope.STEP_TWO = 2, $scope.STEP_THREE = 3, $scope.STEP_FOUR = 4;
  $scope.facilities = facilities;
  $scope.productProfiles = productProfiles;
  $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
  $scope.currentStep = $scope.STEP_ONE; //set initial step
  $scope.moveTo = function(step){
    $scope.currentStep = step;
  };

  $scope.loadAppFacilityProfile = function(nextStep, isEmailValid){
    $scope.isSubmitted = true;
    $scope.disableBtn = isEmailValid;
    appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid)
      .then(function(result){
        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = false;
        $scope.appConfig.stockCountInterval = result.stockCountInterval;
        $scope.appConfig.contactPerson = result.contactPerson;
        $scope.appConfig.facility = JSON.stringify(result.appFacility);//used to pre-select facility drop down
        $scope.appConfig.selectedProductProfiles = result.selectedProductProfiles;
        $scope.preSelectProductProfileCheckBox =
            appConfigService.generateAssociativeArray($scope.appConfig.selectedProductProfiles);

        $scope.moveTo(nextStep);

      }, function(error){
        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = true;
        console.log(error);
      });
  }

  $scope.appConfig = {
    facility: '',
    stockCountInterval: '',
    contactPerson: {
      name: '',
      phoneNo: ''
    },
    selectedProductProfiles: []
  };

  $scope.handleSelectionEvent = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.addProductProfile(productProfile, $scope.appConfig.selectedProductProfiles);
  };

  $scope.save = function(){
   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility);

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

}).controller('EditAppConfigCtrl', function ($scope, facilities, productProfiles, appConfigService, alertsFactory, $log,
                                         i18n, $state, appConfig) {
 $scope.stockCountIntervals = appConfigService.stockCountIntervals;
 $scope.facilities = facilities;
 $scope.productProfiles = productProfiles;
 $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
 $scope.preSelectProductProfileCheckBox = {};
 $scope.isSubmitted = false;
 //used to hold config form data
 $scope.appConfig = {
    facility: '',
    stockCountInterval: '',
    contactPerson: {
      name: '',
      phoneNo: ''
    },
    selectedProductProfiles: []
  };

 function preLoadConfigForm(appConfig){
   if(appConfig === undefined) {
     return;
   }
   $scope.appConfig.contactPerson = appConfig.contactPerson;
   $scope.appConfig.stockCountInterval = parseInt(appConfig.stockCountInterval);
   $scope.appConfig.facility = appConfig.facility;
   $scope.appConfig.appFacility = appConfig.appFacility;
   $scope.appConfig.selectedProductProfiles = appConfig.selectedProductProfiles;
   $scope.preSelectProductProfileCheckBox =
            appConfigService.generateAssociativeArray($scope.appConfig.selectedProductProfiles);
 };

 //pre-load edit app facility profile config form with existing config.
 preLoadConfigForm(appConfig);

 $scope.handleSelectionEvent = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.addProductProfile(productProfile, $scope.appConfig.selectedProductProfiles);
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
