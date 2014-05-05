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
        return productProfileFactory.getAllWithoutNestedObject();
      },
      deviceInfo: function(deviceInfoService){
        return deviceInfoService.getDeviceInfo();
      },
      ccuProfiles: function(ccuProfileFactory){
        return ccuProfileFactory.getAll();
      },
      setupSurvey: function(surveyFactory){
        return surveyFactory.getSetupSurvey();
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
        return productProfileFactory.getAllWithoutNestedObject();
      },
      appConfig: function(appConfigService){
        return appConfigService.getCurrentAppConfig();
      },
      ccuProfiles: function(ccuProfileFactory){
        return ccuProfileFactory.getAll();
      }
    },
    controller: 'EditAppConfigCtrl',
    data: {
      label: 'Settings'
    }
  })

}).controller('AppConfigWizard', function($scope, facilities, productProfiles, appConfigService, alertsFactory, $state,
        i18n, deviceInfo, setupSurvey, $log, ccuProfiles){
  $scope.isSubmitted = false;
  $scope.preSelectProductProfileCheckBox = {};
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.weekDays = appConfigService.weekDays;
  $scope.STEP_ONE = 1, $scope.STEP_TWO = 2, $scope.STEP_THREE = 3, $scope.STEP_FOUR = 4, $scope.STEP_FIVE = 5;
  $scope.facilities = facilities;
  $scope.productProfiles = productProfiles;
  $scope.ccuProfiles = ccuProfiles;
  $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
  $scope.ccuProfileCheckBoxes = [];
  $scope.preSelectCcuProfiles = {};

  $scope.currentStep = $scope.STEP_ONE; //set initial step
  $scope.moveTo = function(step){
    $scope.currentStep = step;
  };
  $scope.questions = setupSurvey.questions;

  $scope.loadAppFacilityProfile = function(nextStep, isEmailValid){
    $scope.isSubmitted = true;
    $scope.disableBtn = isEmailValid;
    appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid)
      .then(function(result){

        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = false;
        $scope.appConfig.reminderDay = result.reminderDay;
        $scope.appConfig.stockCountInterval = result.stockCountInterval;
        $scope.appConfig.contactPerson = result.contactPerson;
        $scope.appConfig.facility = JSON.stringify(result.appFacility);//used to pre-select facility drop down
        $scope.appConfig.selectedProductProfiles = result.selectedProductProfiles;
        $scope.appConfig.selectedCcuProfiles = result.selectedCcuProfiles || [];
        $scope.preSelectCcuProfiles =
            appConfigService.generateAssociativeArray($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
        $scope.preSelectProductProfileCheckBox =
            appConfigService.generateAssociativeArray($scope.appConfig.selectedProductProfiles);

        $scope.moveTo(nextStep);

      })
      .catch(function(error){
        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = true;
      });
  }

  var deviceEmail = '';
  if(typeof deviceInfo === 'object'){
    deviceEmail = deviceInfo.mainAccount;
  }

  $scope.appConfig = {
    uuid: deviceEmail,
    facility: '',
    stockCountInterval: '',
    reminderDay: '',
    contactPerson: {
      name: '',
      phoneNo: ''
    },
    selectedProductProfiles: [],
    selectedCcuProfiles: [],
    dateAdded: undefined
  };

  $scope.onCcuSelection = function (ccuProfile) {
    $scope.appConfig.selectedCcuProfiles =
        appConfigService.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
  };

  $scope.onProductProfileSelection = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.addObjectToCollection(productProfile, $scope.appConfig.selectedProductProfiles, 'uuid');
  };

  $scope.save = function(){
    $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility);
    $scope.isSaving = true;
    appConfigService.setup($scope.appConfig)
        .then(function (result) {
          if (typeof result !== 'undefined') {
            $scope.appConfig.uuid = result;
            $state.go('home.index.home.mainActivity', {'appConfigResult': i18n('appConfigSuccessMsg') });
          } else {
            alertsFactory.danger(i18n('appConfigFailedMsg'));
          }
        }).catch(function (reason) {
          alertsFactory.danger(i18n('appConfigFailedMsg'));
        }).finally(function () {
          $scope.isSaving = false;
        });
  };

}).controller('EditAppConfigCtrl', function ($scope, facilities, productProfiles, appConfigService, alertsFactory, $log,
                                         i18n, $state, appConfig, ccuProfiles, utility) {

 $scope.stockCountIntervals = appConfigService.stockCountIntervals;
 $scope.weekDays = appConfigService.weekDays;
 $scope.facilities = facilities;
 $scope.productProfiles = productProfiles;
 $scope.ccuProfiles = ccuProfiles;

 //used to hold check box selection for both ccu and product profile
 $scope.productProfileCheckBoxes = [];
 $scope.ccuProfileCheckBoxes = [];

 $scope.preSelectProductProfileCheckBox = {};
 $scope.isSubmitted = false;
 //used to hold config form data
 $scope.appConfig = appConfig;

 function preLoadConfigForm(appConfig){
   if(appConfig === undefined) {
     return;
   }
   $scope.appConfig.contactPerson = appConfig.contactPerson;
   $scope.appConfig.reminderDay = appConfig.reminderDay;
   $scope.appConfig.stockCountInterval = parseInt(appConfig.stockCountInterval);
   $scope.appConfig.facility = appConfig.facility;
   $scope.appConfig.appFacility = appConfig.appFacility;
   $scope.appConfig.selectedProductProfiles = appConfig.selectedProductProfiles || [];
   $scope.appConfig.selectedCcuProfiles = appConfig.selectedCcuProfiles || [];
   $scope.preSelectCcuProfiles = appConfigService.generateAssociativeArray(appConfig.selectedCcuProfiles, 'dhis2_modelid');
   $scope.preSelectProductProfileCheckBox =
            appConfigService.generateAssociativeArray($scope.appConfig.selectedProductProfiles, 'uuid');
 };

 //pre-load edit app facility profile config form with existing config.
 preLoadConfigForm(appConfig);

 $scope.onCcuSelection = function(ccuProfile){
   $scope.appConfig.selectedCcuProfiles =
       appConfigService.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
 };

 $scope.onProductProfileSelection = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.addObjectToCollection(productProfile, $scope.appConfig.selectedProductProfiles, 'uuid');
 };

 $scope.save = function(){
   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility);
   $scope.isSaving = true;

   appConfigService.setup($scope.appConfig)
       .then(function (result) {
         if (typeof result !== 'undefined') {
           $scope.appConfig.uuid = result;
           $state.go('home.index.home.mainActivity', {'appConfigResult': i18n('appConfigSuccessMsg') });
         } else {
           alertsFactory.danger(i18n('appConfigFailedMsg'));
         }
       })
       .catch(function (reason) {
         alertsFactory.danger(i18n('appConfigFailedMsg'));
         $log.error(reason);
       }).finally(function () {
         $scope.isSaving = false;
       });
 };
});
