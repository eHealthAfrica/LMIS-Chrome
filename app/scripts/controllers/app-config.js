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

}).controller('AppConfigWizard', function($scope, facilities, productProfiles, appConfigService, alertsFactory, $state,
        i18n, facilityFactory, productProfileFactory){
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
    appConfigService.getAppFacilityProfileByEmail($scope.appConfig.email)
      .then(function(result){
        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = false;
        $scope.appConfig.contactPerson = result.contactPerson;
        //TODO: move transformation of remote app facility profile into complete object to app-config-service
        facilityFactory.get(result.appFacility).then(function(facility){
          $scope.appConfig.facility = JSON.stringify(facility);
        }, function(reason){
          //TODO: think of what to do if loading facility failed.
          console.error(reason);
        });
        productProfileFactory.getBatch(result.selectedProductProfiles)
          .then(function(productProfiles){
            $scope.appConfig.selectedProductProfiles = productProfiles;
            //TODO: refactor the line below to app-config-service so that appConfigWizard and editAppConfig can use it.
            for (var index in $scope.appConfig.selectedProductProfiles) {
              var selectedProductProfile = $scope.appConfig.selectedProductProfiles[index];
              $scope.preSelectProductProfileCheckBox[selectedProductProfile.uuid] = selectedProductProfile;
            }
          }, function(error){
            //TODO: think of what to do if loading product profiles failed.
            console.log(error);
        });
        console.log(result.selectedProductProfiles);
        $scope.appConfig.stockCountInterval = result.stockCountInterval;
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
    //TODO: refactor this into common function both controllers can share. or call createApp config here.
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
   for (var index in appConfig.selectedProductProfiles) {
     var selectedProductProfile = appConfig.selectedProductProfiles[index];
     $scope.preSelectProductProfileCheckBox[selectedProductProfile.uuid] = selectedProductProfile;
   }
 };
 //pre-load config form with existing app config.
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
