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
      },
      deviceInfo: function(deviceInfoService){
        return deviceInfoService.getDeviceInfo();
      },
      surveyQuestions: function(surveyFactory){
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
        i18n, deviceInfo, surveyQuestions, surveyFactory){
  $scope.isSubmitted = false;
  $scope.preSelectProductProfileCheckBox = {};
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.STEP_ONE = 1, $scope.STEP_TWO = 2, $scope.STEP_THREE = 3, $scope.STEP_FOUR = 4, $scope.STEP_FIVE = 5;
  $scope.facilities = facilities;
  $scope.productProfiles = productProfiles;
  $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
  $scope.currentStep = $scope.STEP_ONE; //set initial step
  $scope.moveTo = function(step){
    $scope.currentStep = step;
  };
  $scope.questions = surveyQuestions;

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
    selectedProductProfiles: []
  };

  $scope.surveyResponse = [];

  $scope.handleSelectionEvent = function(productProfile){
   $scope.appConfig.selectedProductProfiles =
       appConfigService.addProductProfile(productProfile, $scope.appConfig.selectedProductProfiles);
  };

  $scope.save = function(){

   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility);
   $scope.isSaving = true;

   //prepare survey response and save.
   var responses = [];
   for(var index in $scope.surveyResponse){
     var response = {question: index, answer: $scope.surveyResponse[index]}
     responses.push(response);
   }
   var surveyResponse = {
     facility: $scope.appConfig.appFacility.uuid,
     respondent: $scope.appConfig.contactPerson,
     responses: responses,
     isComplete: surveyQuestions.length === responses.length
   };

   appConfigService.setup($scope.appConfig)
    .then(function (result) {
      if(result !== undefined){
        $scope.appConfig.uuid = result;
        $scope.isSaving = false;
        appConfigService.cache.put(appConfigService.APP_CONFIG, $scope.appConfig);
        $state.go('home.index.mainActivity',{'appConfigResult': i18n('appConfigSuccessMsg') });
        surveyFactory.saveSurveyResponse(surveyResponse)
          .then(function(result){
            if(typeof result === 'undefined'){
              alertsFactory.danger('Saving of survey response failed');
            }
          }, function(reason){
            console.log(reason);
            alertsFactory.danger('Saving of survey response failed');
          });

      } else {
        $scope.isSaving = false;
        alertsFactory.danger(i18n('appConfigFailedMsg'));
      }
   }, function (reason) {
      $scope.isSaving = false;
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
    reminderDay: '',
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
   $scope.appConfig.reminderDay = appConfig.reminderDay;
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
   $scope.appConfig.appFacility = JSON.parse($scope.appConfig.facility);
   $scope.isSaving = true;
   appConfigService.setup($scope.appConfig)
    .then(function (result) {
      if(result !== undefined){
        appConfigService.cache.put(appConfigService.APP_CONFIG, $scope.appConfig);
        $scope.isSaving = false;
        $state.go('home.index.mainActivity',{'appConfigResult': i18n('appConfigSuccessMsg') });
      } else {
        $scope.isSaving = false;
        alertsFactory.danger(i18n('appConfigFailedMsg'));
      }
   }, function (reason) {
      $scope.isSaving = false;
      alertsFactory.danger(i18n('appConfigFailedMsg'));
      $log.error(reason);
   });
 };
});
