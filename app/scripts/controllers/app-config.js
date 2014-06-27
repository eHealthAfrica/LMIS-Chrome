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
        deviceEmail: function ($q, deviceInfoFactory) {
          var deferred = $q.defer();
          deviceInfoFactory.getDeviceInfo()
            .then(function (result) {
              deferred.resolve(result.mainAccount);
            })
            .catch(function () {
              deferred.resolve('');
            });
          return deferred.promise;
        },
        ccuProfilesGroupedByCategory: function (ccuProfileFactory, $q) {
          return $q.when(ccuProfileFactory.getAllGroupedByCategory());
        },
        productProfilesGroupedByCategory: function (productProfileFactory, $q) {
          return $q.when(productProfileFactory.getAllGroupedByCategory());
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
        appConfig: function (appConfigService) {
          return appConfigService.getCurrentAppConfig();
        },
        ccuProfilesGroupedByCategory: function (ccuProfileFactory, $q) {
          return $q.when(ccuProfileFactory.getAllGroupedByCategory());
        },
        productProfilesGroupedByCategory: function (productProfileFactory, $q) {
          return $q.when(productProfileFactory.getAllGroupedByCategory());
        }
      },
      controller: 'EditAppConfigCtrl',
      data: {
        label: 'Settings'
      }
    });

}).controller('AppConfigWizard',function ($scope, appConfigService, growl, $state, alertFactory, i18n, deviceEmail, $log, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility) {

    $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords;
    $scope.isSubmitted = false;
    $scope.preSelectProductProfileCheckBox = {};
    $scope.stockCountIntervals = appConfigService.stockCountIntervals;
    $scope.weekDays = appConfigService.weekDays;
    $scope.STEP_ONE = 1;
    $scope.STEP_TWO = 2;
    $scope.STEP_THREE = 3;
    $scope.STEP_FOUR = 4;
    $scope.STEP_FIVE = 5;
    $scope.ccuProfilesCategories = Object.keys(ccuProfilesGroupedByCategory);
    $scope.ccuProfilesGroupedByCategory = ccuProfilesGroupedByCategory;
    $scope.productProfileCategories = Object.keys(productProfilesGroupedByCategory);
    $scope.productProfilesGroupedByCategory = productProfilesGroupedByCategory;
    $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
    $scope.ccuProfileCheckBoxes = [];
    $scope.preSelectCcuProfiles = {};

    $scope.currentStep = $scope.STEP_ONE; //set initial step
    $scope.moveTo = function (step) {
      $scope.currentStep = step;
    };

    $scope.loadAppFacilityProfile = function (nextStep, isEmailValid) {
      $scope.isSubmitted = true;
      $scope.disableBtn = isEmailValid;
      appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid)
        .then(function (result) {
          $scope.disableBtn = false;
          $scope.isSubmitted = false;
          $scope.profileNotFound = false;

          $scope.appConfig.facility = result;
          $scope.appConfig.facility.reminderDay = result.reminderDay;
          $scope.appConfig.facility.stockCountInterval = result.stockCountInterval;
          $scope.appConfig.contactPerson.name = $scope.appConfig.facility.contact.name;
          $scope.appConfig.contactPerson.phoneNo = $scope.appConfig.facility.contact.oldphone;
          $scope.appConfig.selectedCcuProfiles = result.selectedCcuProfiles || [];

          $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
          $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');

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
      facility: {},
      contactPerson: {
        name: '',
        phoneNo: ''
      },
      selectedCcuProfiles: [],
      dateActivated: undefined
    };

    $scope.onCcuSelection = function (ccuProfile) {
      $scope.appConfig.selectedCcuProfiles =
        utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    };

    $scope.onProductProfileSelection = function (productProfile) {
      $scope.appConfig.facility.selectedProductProfiles =
        utility.addObjectToCollection(productProfile, $scope.appConfig.facility.selectedProductProfiles, 'uuid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    };

    $scope.save = function () {
      $scope.isSaving = true;
      appConfigService.setup($scope.appConfig)
        .then(function (result) {
          if (typeof result !== 'undefined') {
            $scope.appConfig = result;
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

  }).controller('EditAppConfigCtrl', function ($scope, appConfigService, growl, $log, i18n, $state, appConfig, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility, alertFactory, $filter) {

    $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords;
    $scope.stockCountIntervals = appConfigService.stockCountIntervals;
    $scope.weekDays = appConfigService.weekDays;
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

    var setAppConfigLastUpdatedViewInfo = function(appConfig){
      if(typeof appConfig === 'object' && typeof appConfig.lastUpdated !== 'undefined'){
        var updatedDate = $filter('date')(new Date(appConfig.lastUpdated), 'yyyy-MM-dd HH:mm:ss');
        $scope.lastUpdated = i18n('lastUpdated', updatedDate);
      }else{
        $scope.lastUpdated = i18n('lastUpdated', 'N/A');
      }
    };

    function preLoadConfigForm(appConfig) {
      if (appConfig === undefined) {
        return;
      }
      setAppConfigLastUpdatedViewInfo(appConfig);

      $scope.appConfig.contactPerson = appConfig.contactPerson;
      $scope.appConfig.facility = appConfig.facility;
      $scope.appConfig.facility.selectedProductProfiles = appConfig.facility.selectedProductProfiles || [];
      $scope.appConfig.selectedCcuProfiles = appConfig.selectedCcuProfiles || [];
      $scope.preSelectCcuProfiles = utility.castArrayToObject(appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    }

    //pre-load edit app facility profile config form with existing config.
    preLoadConfigForm(appConfig);

    $scope.onCcuSelection = function (ccuProfile) {
      $scope.appConfig.selectedCcuProfiles =
        utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    };

    $scope.onProductProfileSelection = function (productProfile) {
      $scope.appConfig.facility.selectedProductProfiles =
        utility.addObjectToCollection(productProfile, $scope.appConfig.facility.selectedProductProfiles, 'uuid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    };

    $scope.save = function () {

      $scope.isSaving = true;
      appConfigService.setup($scope.appConfig)
        .then(function (result) {
          if (typeof result !== 'undefined') {
            $scope.appConfig = result;
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
