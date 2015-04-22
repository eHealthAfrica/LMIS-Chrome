'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('appConfig', {
        parent: 'root.index',
        abstract: true,
        templateUrl: 'views/home/index.html',
      })
      .state('appConfigWelcome', {
        url: '/app-config-welcome',
        parent: 'root.index',
        templateUrl: '/views/app-config/welcome-page.html',
        data: {
          label: 'Welcome'
        }
      })
      .state('appConfig.wizard', {
        url: '/app-config-wizard',
        parent: 'root.index',
        templateUrl: '/views/app-config/wizard.html',
        resolve: {
          deviceEmail: function($q, deviceInfoFactory) {
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
          ccuProfilesGroupedByCategory: function(ccuProfileFactory, $q) {
            return $q.when(ccuProfileFactory.getAllGroupedByCategory());
          },
          productProfilesGroupedByCategory: function(productProfileFactory, $q) {
            return $q.when(productProfileFactory.getAllGroupedByCategory());
          }
        },
        controller: 'AppConfigWizard',
        data: {
          label: 'Configuration wizard'
        }
      })
      .state('appConfig.edit', {
        url: '/edit-app-config',
        parent: 'root.index',
        templateUrl: '/views/app-config/edit-configuration.html',
        resolve: {
          appConfig: function(appConfigService) {
            return appConfigService.getCurrentAppConfig();
          },
          ccuProfilesGroupedByCategory: function(ccuProfileFactory, $q) {
            return $q.when(ccuProfileFactory.getAllGroupedByCategory());
          },
          productProfilesGroupedByCategory: function(productProfileFactory, $q) {
            return $q.when(productProfileFactory.getAllGroupedByCategory());
          }
        },
        controller: 'EditAppConfigCtrl',
        data: {
          label: 'Settings'
        }
      });

  })
  .controller('AppConfigWizard', function($scope, locationService, fixtureLoaderService, appConfigService, growl, $state, alertFactory, i18n, deviceEmail, $log, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility) {
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
    $scope.STEP_SIX = 6;
    $scope.ccuProfilesCategories = Object.keys(ccuProfilesGroupedByCategory);
    $scope.ccuProfilesGroupedByCategory = ccuProfilesGroupedByCategory;
    $scope.productProfileCategories = Object.keys(productProfilesGroupedByCategory);
    $scope.productProfilesGroupedByCategory = productProfilesGroupedByCategory;
    $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
    $scope.ccuProfileCheckBoxes = [];
    $scope.lgaCheckBoxes = [];
    $scope.zoneCheckBoxes = [];
    $scope.preSelectLgaCheckBox = {};
    $scope.preSelectZoneCheckBox = {};
    $scope.preSelectCcuProfiles = {};
    $scope.developerMode = true;
    $scope.lgaList = [];
    //TODO: load state id dynamically.
    locationService.getLgas("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        $scope.lgaList = res;
      })
      .catch(function(err) {
        console.error(err);
      });

    $scope.currentStep = $scope.STEP_ONE; //set initial step
    $scope.moveTo = function(step) {
      $scope.currentStep = step;
    };

   $scope.zones = [];
    locationService.getZones("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        $scope.zones = res;
      })
      .catch(function(err) {
        console.error(err);
      });

    $scope.loadAppFacilityProfile = function(nextStep, isEmailValid) {
      $scope.isSubmitted = true;
      $scope.disableBtn = isEmailValid;
      appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid)
        .then(function(result) {
          $scope.disableBtn = false;
          $scope.isSubmitted = false;
          $scope.profileNotFound = false;

          $scope.appConfig.facility = result;
          $scope.appConfig.facility.reminderDay = result.reminderDay;
          $scope.appConfig.facility.stockCountInterval = result.stockCountInterval;
          $scope.appConfig.facility.selectedLgas = result.selectedLgas || [];
          $scope.appConfig.facility.selectedZones = result.selectedZones || [];
          $scope.appConfig.contactPerson.name = $scope.appConfig.facility.contact.name;
          $scope.appConfig.contactPerson.phoneNo = $scope.appConfig.facility.contact.oldphone;
          $scope.appConfig.selectedCcuProfiles = $scope.appConfig.selectedCcuProfiles || [];

          $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
          $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');

          $scope.moveTo(nextStep);

        })
        .catch(function() {
          $scope.disableBtn = false;
          $scope.isSubmitted = false;
          $scope.profileNotFound = true;
        });
    };

    $scope.appConfig = {
      uuid: deviceEmail,
      facility: { },
      contactPerson: {
        name: '',
        phoneNo: ''
      },
      selectedCcuProfiles: [],
      dateActivated: undefined,
    };

    $scope.onCcuSelection = function(ccuProfile) {
      $scope.appConfig.selectedCcuProfiles =
        utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    };

    $scope.onProductProfileSelection = function(productProfile) {
      $scope.appConfig.facility.selectedProductProfiles =
        utility.addObjectToCollection(productProfile, $scope.appConfig.facility.selectedProductProfiles, 'uuid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    };

    $scope.onLgaSelection = function(lga){

      appConfigService.getSelectedFacility((JSON.parse(lga)).uuid);
      $scope.appConfig.facility.selectedLgas =
        utility.addObjectToCollection(lga, $scope.appConfig.facility.selectedLgas, '_id');
      $scope.preSelectLgaCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedLgas, '_id');
    };
    $scope.onZoneSelection = function(zone){
      console.log($scope.appConfig.facility);
      $scope.appConfig.facility.selectedZones = utility.addObjectToCollection(zone, $scope.appConfig.facility.selectedZones, '_id');
      $scope.preSelectZoneCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedZones, '_id');

    }
    $scope.save = function() {
      $scope.isSaving = true;
      var nearbyLgas = $scope.appConfig.facility.selectedLgas
        .map(function(lga) {
          if (lga._id) {
            return lga._id;
          }
        });
      fixtureLoaderService.setupWardsAndFacilitesByLgas(nearbyLgas)
        .finally(function() {

          appConfigService.setup($scope.appConfig)
            .then(function(result) {
              if (typeof result !== 'undefined') {
                $scope.appConfig = result;
                alertFactory.success(i18n('appConfigSuccessMsg'));
                $state.go('home.index.home.mainActivity');
              } else {
                growl.error(i18n('appConfigFailedMsg'));
              }
            }).catch(function() {
              growl.error(i18n('appConfigFailedMsg'));
            }).finally(function() {
              $scope.isSaving = false;
            });
        });
    };
  })
  .controller('EditAppConfigCtrl', function($scope, fixtureLoaderService, locationService, $rootScope, appConfigService, growl, $log, i18n, $state, appConfig, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility, alertFactory, $filter) {

    $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords;
    var oldLgas = [];
    //console.log(appConfig);
    if (utility.has(appConfig.facility, 'selectedLgas')) {
      oldLgas = angular.copy(appConfig.facility.selectedLgas);
    }
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
    $scope.appConfig.selectedLgas = [];
    $scope.appConfig.selectedZones = [];
    $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords;
    $scope.isSubmitted = false;
    $scope.preSelectProductProfileCheckBox = {};
    $scope.stockCountIntervals = appConfigService.stockCountIntervals;
    $scope.weekDays = appConfigService.weekDays;
    $scope.ccuProfilesCategories = Object.keys(ccuProfilesGroupedByCategory);
    $scope.ccuProfilesGroupedByCategory = ccuProfilesGroupedByCategory;
    $scope.productProfileCategories = Object.keys(productProfilesGroupedByCategory);
    $scope.productProfilesGroupedByCategory = productProfilesGroupedByCategory;
    $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
    $scope.ccuProfileCheckBoxes = [];
    $scope.lgaCheckBoxes = [];
    $scope.zoneCheckBoxes = [];
    $scope.preSelectLgaCheckBox = {};
    $scope.preSelectZoneCheckBox = {};
    $scope.preSelectCcuProfiles = {};
    $scope.developerMode = false;
    $rootScope.developerMode = false;
    $scope.lgaList = [];
    $scope.serialNumber = {};


    var noOfAttempts = 0;

    $scope.enterDeveloperMode = function() {
      var MAX_ATTEMPTS = 5;
      noOfAttempts = noOfAttempts + 1;
      if (MAX_ATTEMPTS <= noOfAttempts) {
        $rootScope.developerMode = true;
        $scope.developerMode = true;
        noOfAttempts = 0;
      }
    };

    $scope.addSerialNumber = function() {
      var ccuItemID = Object.keys($scope.selectedCCEItem)[0];
      var ccuProfile = $scope.preSelectCcuProfiles[ccuItemID];
      ccuProfile.serialNumbers = ccuProfile.serialNumbers || [];

      if ($scope.serialNumber[ccuItemID] === '' || angular.isUndefined($scope.serialNumber[ccuItemID]) ||
        ccuProfile.serialNumbers.indexOf($scope.serialNumber[ccuItemID]) !== -1) {
        return;
      }

      ccuProfile.serialNumbers.push($scope.serialNumber[ccuItemID]);
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');

      $scope.serialNumber[ccuItemID] = '';
    };

    $scope.removeSerial = function(ccuProfile, index) {
      ccuProfile.serialNumbers.splice(index, 1);
    };

    function resetRowState() {
      $scope.selectedCCEItem = {};
    }

    function toggleRow(ccuProfile) {

      if (!angular.isObject(ccuProfile)) {
        ccuProfile = JSON.parse(ccuProfile);
      }

      if (utility.isEmptyObject($scope.selectedCCEItem)) {
        $scope.selectedCCEItem[ccuProfile.dhis2_modelid] = true;
      } else if ($scope.selectedCCEItem.hasOwnProperty(ccuProfile.dhis2_modelid)) {
        $scope.selectedCCEItem[ccuProfile.dhis2_modelid] = !$scope.selectedCCEItem[ccuProfile.dhis2_modelid];
      } else {
        resetRowState();
        $scope.selectedCCEItem[ccuProfile.dhis2_modelid] = true;
      }

      if ($scope.ccuProfileCheckBoxes[ccuProfile.dhis2_modelid]) {
        var selectedCCU = JSON.parse($scope.ccuProfileCheckBoxes[ccuProfile.dhis2_modelid]);
        if (selectedCCU.deSelected) {
          resetRowState();
        }
      }
    }

    $scope.toggleRow = toggleRow;

    var setAppConfigLastUpdatedViewInfo = function(appConfig) {
      if (utility.has(appConfig, 'lastUpdated')) {
        var updatedDate = $filter('date')(new Date(appConfig.lastUpdated), 'yyyy-MM-dd HH:mm:ss');
        $scope.lastUpdated = i18n('lastUpdated', updatedDate);
      } else {
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
      $scope.appConfig.facility.selectedLgas = appConfig.facility.selectedLgas || [];
      $scope.appConfig.facility.selectedZones = appConfig.facility.selectedZones || [];
      $scope.preSelectLgaCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedLgas, '_id');
      $scope.preSelectZoneCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedZones, '_id');

      $scope.preSelectCcuProfiles = utility.castArrayToObject(appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    }

    resetRowState();
    //pre-load edit app facility profile config form with existing config.
    preLoadConfigForm(appConfig);
    //TODO: load state id dynamically.
    locationService.getLgas("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        $scope.lgaList = res;
      })
      .catch(function(err) {
        console.error(err);
      });
    $scope.zones = [];
    locationService.getZones("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        $scope.zones = res;
      })
      .catch(function(err) {
        console.error(err);
      });

    $scope.onCcuSelection = function(ccuProfile) {
      toggleRow(ccuProfile);
      $scope.appConfig.selectedCcuProfiles =
        utility.addObjectToCollection(ccuProfile, $scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');
    };

    $scope.onProductProfileSelection = function(productProfile) {
      $scope.appConfig.facility.selectedProductProfiles =
        utility.addObjectToCollection(productProfile, $scope.appConfig.facility.selectedProductProfiles, 'uuid');
      $scope.preSelectProductProfileCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedProductProfiles, 'uuid');
    };

    $scope.onLgaSelection = function(lga) {

      appConfigService.getSelectedFacility((JSON.parse(lga).uuid), event);
      $scope.appConfig.facility.selectedLgas =
        utility.addObjectToCollection(lga, $scope.appConfig.facility.selectedLgas, '_id');
      $scope.preSelectLgaCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedLgas, '_id');
    };
    $scope.onZoneSelection = function(zone){
      $scope.appConfig.facility.selectedZones =
        utility.addObjectToCollection(zone, $scope.appConfig.facility.selectedZones, '_id');
      $scope.preSelectZoneCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedZones, '_id');
    };

    var isSameLgas = function(old, recent) {
      if (old.length !== recent.length) {
        return false;
      }
      var hasOddElem = true;
      recent.forEach(function(rLga) {
        var similar = old.filter(function(oLga) {
          return rLga._id === oLga._id;
        });
        if (similar.length === 0) {
          hasOddElem = false;
        }
      });
      return hasOddElem;
    };

    var saveAppConfig = function(forSerial) {
      appConfigService.setup($scope.appConfig)
        .then(function(result) {
          if (typeof result !== 'undefined') {
            alertFactory.success(i18n('appConfigSuccessMsg'));

            if (!forSerial) {
              $scope.appConfig = result;
              $state.go('home.index.home.mainActivity');
            }

          } else {
            growl.error(i18n('appConfigFailedMsg'));
          }
        })
        .catch(function(reason) {
          if (utility.has(reason, 'type') && reason.type === 'SAVED_NOT_SYNCED') {
            alertFactory.success(i18n('appConfigSuccessMsg'));
            $state.go('home.index.home.mainActivity');
            console.info('not synced');
          } else {
            growl.error(i18n('appConfigFailedMsg'));
            console.error(reason);
          }
        })
        .finally(function() {
          $scope.isSaving = false;
        });
    };

    $scope.save = function(forSerial) {
      $scope.isSaving = true;
      if (isSameLgas(oldLgas, $scope.appConfig.facility.selectedLgas)) {
        saveAppConfig(forSerial);
      } else {
        var nearbyLgas = $scope.appConfig.facility.selectedLgas
          .map(function(lga) {
            if (lga._id) {
              return lga._id;
            }
          });
        fixtureLoaderService.setupWardsAndFacilitesByLgas(nearbyLgas)
          .then(function(res) {
            saveAppConfig();
          })
          .catch(function(err) {
            growl.error(i18n('lgaUpdateFailed'));
            $scope.isSaving = false;
          });
      }
    };

  });
