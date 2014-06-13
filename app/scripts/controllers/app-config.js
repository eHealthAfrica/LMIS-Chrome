'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('appConfig', {
    parent: 'root.index',
    abstract: true,
    templateUrl: 'views/home/index.html',
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
      deviceEmail: function($q, deviceInfoFactory){
        var deferred = $q.defer();
        deviceInfoFactory.getDeviceInfo()
          .then(function(result) {
            deferred.resolve(result.mainAccount);
          })
          .catch(function() {
            deferred.resolve('');
          });
        return deferred.promise;
      },
      ccuProfilesGroupedByCategory: function(ccuProfileFactory, syncService, storageService, $q){
        var deferred = $q.defer();
        var obj = {};
        syncService.updateDbFromRemote(storageService.CCU_PROFILE)
            .finally(function(){
                ccuProfileFactory.getAllGroupedByCategory()
                    .then(function(res){
                        obj = res;
                        deferred.resolve(obj);
                    })
                    .catch(function(){
                        deferred.resolve(obj);
                    });
            });
        return deferred.promise;
      },
      productProfilesGroupedByCategory: function(productProfileFactory, syncService, storageService, $q){
        var deferred = $q.defer();
        var obj = {};
        syncService.updateDbFromRemote(storageService.PRODUCT_PROFILE)
            .finally(function(){
                productProfileFactory.getAllGroupedByCategory()
                    .then(function(res){
                        obj = res;
                        deferred.resolve(obj);
                    })
                    .catch(function(){
                        deferred.resolve(obj);
                    });
            });
        return deferred.promise;
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
      appConfig: function(appConfigService){
        return appConfigService.getCurrentAppConfig();
      },
      ccuProfilesGroupedByCategory: function(ccuProfileFactory){
        return ccuProfileFactory.getAllGroupedByCategory();
      },
      productProfilesGroupedByCategory: function(productProfileFactory){
        return productProfileFactory.getAllGroupedByCategory();
      }
    },
    controller: 'EditAppConfigCtrl',
    data: {
      label: 'Settings'
    }
  });

}).controller('AppConfigWizard', function($scope, facilities, appConfigService, growl, $state, alertFactory,
        i18n, deviceEmail, $log, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility){

  $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords
  $scope.isSubmitted = false;
  $scope.preSelectProductProfileCheckBox = {};
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.weekDays = appConfigService.weekDays;
  $scope.STEP_ONE = 1;
  $scope.STEP_TWO = 2;
  $scope.STEP_THREE = 3;
  $scope.STEP_FOUR = 4;
  $scope.STEP_FIVE = 5;
  $scope.facilities = facilities;
  $scope.ccuProfilesCategories = Object.keys(ccuProfilesGroupedByCategory);
  $scope.ccuProfilesGroupedByCategory = ccuProfilesGroupedByCategory;
  $scope.productProfileCategories = Object.keys(productProfilesGroupedByCategory);
  $scope.productProfilesGroupedByCategory = productProfilesGroupedByCategory;
  $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
  $scope.ccuProfileCheckBoxes = [];
  $scope.preSelectCcuProfiles = {};

  $scope.currentStep = $scope.STEP_ONE; //set initial step
  $scope.moveTo = function(step){
    $scope.currentStep = step;
  };

  $scope.loadAppFacilityProfile = function(nextStep, isEmailValid){
    $scope.isSubmitted = true;
    $scope.disableBtn = isEmailValid;
    appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid)
        .then(function (result) {

          $scope.disableBtn = false;
          $scope.isSubmitted = false;
          $scope.profileNotFound = false;

          $scope.appConfig.facility = result;
          $scope.appConfig.reminderDay = result.reminderDay;
          $scope.appConfig.stockCountInterval = result.stockCountInterval;
          $scope.appConfig.contactPerson.name = result.contact.name;
          $scope.appConfig.contactPerson.phoneNo = result.contact.oldphone;
          $scope.appConfig.selectedProductProfiles = result.selectedProductProfiles || [];
          $scope.appConfig.selectedCcuProfiles = result.selectedCcuProfiles || [];

          $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
          $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.selectedProductProfiles, 'uuid');
          $scope.moveTo(nextStep);

        })
        .catch(function () {
          $scope.disableBtn = false;
          $scope.isSubmitted = false;
          $scope.profileNotFound = true;
        });
  };

  $scope.appConfig = {
      uuid: deviceEmail,
      facility: '',
      stockCountInterval: '',
      reminderDay: '',
      contactPerson: { name: '', phoneNo: ''},
      selectedProductProfiles: [],
      selectedCcuProfiles: [],
      dateAdded: undefined
    };

  $scope.onCcuSelection = function (ccuProfile) {
    $scope.appConfig.selectedCcuProfiles =
          utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
  };

  $scope.onProductProfileSelection = function (productProfile) {
    $scope.appConfig.selectedProductProfiles =
          utility.addObjectToCollection(productProfile, $scope.appConfig.selectedProductProfiles, 'uuid');
    $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.selectedProductProfiles, 'uuid');
  };

  $scope.save = function () {
      $scope.isSaving = true;
      appConfigService.setup($scope.appConfig)
          .then(function (result) {
            if (typeof result !== 'undefined') {
              $scope.appConfig.uuid = result;
              alertFactory.success(i18n('appConfigSuccessMsg'));
              $state.go('home.index.home.mainActivity');
            } else {
              growl.error(i18n('appConfigFailedMsg'));
            }
          }).catch(function () {
            growl.error(i18n('appConfigFailedMsg'));
          }).finally(function () {
            $scope.isSaving = false;
          });
    };

}).controller('EditAppConfigCtrl', function ($scope, facilities, appConfigService, growl, $log, i18n, $state, appConfig,
                                             ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility, alertFactory) {

  $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords
  $scope.stockCountIntervals = appConfigService.stockCountIntervals;
  $scope.weekDays = appConfigService.weekDays;
  $scope.facilities = facilities;
  $scope.ccuProfilesCategories = Object.keys(ccuProfilesGroupedByCategory);
  $scope.ccuProfilesGroupedByCategory = ccuProfilesGroupedByCategory;
  $scope.productProfileCategories = Object.keys(productProfilesGroupedByCategory);
  $scope.productProfilesGroupedByCategory = productProfilesGroupedByCategory;

  //used to hold check box selection for both ccu and product profile
  $scope.productProfileCheckBoxes = [];
  $scope.ccuProfileCheckBoxes = [];
  $scope.preSelectProductProfileCheckBox = {};
  $scope.isSubmitted = false;
  //used to hold config form data
  $scope.appConfig = appConfig;

  function preLoadConfigForm(appConfig) {
    if (appConfig === undefined) {
      return;
    }
    $scope.appConfig.contactPerson = appConfig.contactPerson;
    $scope.appConfig.reminderDay = appConfig.reminderDay;
    $scope.appConfig.stockCountInterval = parseInt(appConfig.stockCountInterval);
    $scope.appConfig.facility = appConfig.facility;
    $scope.appConfig.selectedProductProfiles = appConfig.selectedProductProfiles || [];
    $scope.appConfig.selectedCcuProfiles = appConfig.selectedCcuProfiles || [];
    $scope.preSelectCcuProfiles = utility.castArrayToObject(appConfig.selectedCcuProfiles, 'dhis2_modelid');
    $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.selectedProductProfiles, 'uuid');
  }

  //pre-load edit app facility profile config form with existing config.
  preLoadConfigForm(appConfig);

  $scope.onCcuSelection = function (ccuProfile) {
    $scope.appConfig.selectedCcuProfiles =
      utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
  };

  $scope.onProductProfileSelection = function (productProfile) {
    $scope.appConfig.selectedProductProfiles =
      utility.addObjectToCollection(productProfile, $scope.appConfig.selectedProductProfiles, 'uuid');
    $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.selectedProductProfiles, 'uuid');
  };

  $scope.save = function () {

    $scope.isSaving = true;
    appConfigService.setup($scope.appConfig)
        .then(function (result) {
          if (typeof result !== 'undefined') {
            $scope.appConfig.uuid = result;
            alertFactory.success(i18n('appConfigSuccessMsg'));
            $state.go('home.index.home.mainActivity');
          } else {
            growl.error(i18n('appConfigFailedMsg'));
          }
        })
        .catch(function (reason) {
          growl.error(i18n('appConfigFailedMsg'));
          $log.error(reason);
        }).finally(function () {
          $scope.isSaving = false;
        });
  };

});
