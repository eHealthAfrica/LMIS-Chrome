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
  .controller('AppConfigWizard', function($scope, storageService, facilityFactory, locationService, fixtureLoaderService, appConfigService, growl, $state, alertFactory, i18n,  $log,  utility, deviceEmail, backgroundSyncService, ccuProfileFactory, productProfileFactory, $q) {
    $scope.STEP_ONE = 1;
    $scope.STEP_TWO = 2;
    $scope.STEP_THREE = 3;
    $scope.STEP_FOUR = 4;
    $scope.STEP_FIVE = 5;
    $scope.STEP_SIX = 6;
    $scope.weekDays = appConfigService.weekDays;
    $scope.productProfileCheckBoxes = [];//used to productProfile models for checkbox
    $scope.ccuProfileCheckBoxes = [];
    $scope.lgaCheckBoxes = [];
    $scope.zoneCheckBoxes = [];
    $scope.preSelectLgaCheckBox = {};
    $scope.preSelectZoneCheckBox = {};
    $scope.preSelectCcuProfiles = {};
    $scope.developerMode = true;
    $scope.lgaList = [];
    $scope.spaceOutUpperCaseWords = utility.spaceOutUpperCaseWords;
    $scope.isSubmitted = false;
    $scope.preSelectProductProfileCheckBox = {};
    $scope.stockCountIntervals = appConfigService.stockCountIntervals;
    $scope.serialNumber = {};
    $scope.errorMsg = {};
    $scope.firstConfig = true;

    //TODO: load state id dynamically.
    locationService.getLgas("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        $scope.lgaList = res;
      })
      .catch(function(err) {
        console.error(err);
      });

    $scope.currentStep = $scope.STEP_ONE; //set initial step

    $scope.appConfig = {
      uuid: deviceEmail,
      pwd: '',
      facility: { },
      contactPerson: {
        name: '',
        phoneNo: ''
      },
      selectedCcuProfiles: [],
      dateActivated: undefined
    };

    $scope.moveTo = function(step) {
      $scope.currentStep = step;
    };
    $scope.authenticate = function(isEmailValid, isPwdValid){
      $scope.loadingloadingFixtures = true;
      $scope.isSubmitted = true;
      $scope.disableBtn = isEmailValid;
      storageService.save('lomisUser', {
        "email": $scope.appConfig.uuid,
        "password": $scope.appConfig.pwd,
      })
        .then(loadAppConfig)
        .then(ccuProfilesGroupedByCategory)
        .then(productProfilesGroupedByCategory)
        .then(loadLgas)
        .then(loadZones)
        .catch(function(err){
          console.log(err);
        });
    };
    var loadAppFacilityProfile = function() {

      appConfigService.getAppFacilityProfileByEmail($scope.appConfig.uuid, $scope.appConfig.pwd)
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
        $scope.loadingFixtures = false;
        $scope.moveTo($scope.STEP_TWO);
      })
      .catch(function() {
        $scope.disableBtn = false;
        $scope.isSubmitted = false;
        $scope.profileNotFound = true;
      });

    };
    function navigateToHome() {
      $state.go('home.index.home.mainActivity');
      backgroundSyncService.startBackgroundSync()
        .finally(function() {
          console.log('updateAppConfigAndStartBackgroundSync triggered on start up has been completed!');
        });

      analyticsSyncService.syncOfflineAnalytics()
        .finally(function() {
          console.log('offline reports send to ga server.');
        });
    }
    function loadAppConfig() {
      //TODO: figure out a better way of knowing if the app has been configured or not.

      return storageService.all(storageService.APP_CONFIG)
        .then(function(res) {
          if (res.length > 0) {

            return fixtureLoaderService.loadLocalDatabasesIntoMemory(fixtureLoaderService.REMOTE_FIXTURES)
              .then(function(result) {

                $rootScope.$emit('MEMORY_STORAGE_LOADED');
                navigateToHome();
                return result;
              })
              .catch(function(reason) {
                console.error(reason);
                growl.error('loading storage into memory failed, contact support.', {ttl: -1});
                return reason;
              });
          } else {
            var loadRemoteFixture = function() {
              return fixtureLoaderService.setupLocalAndMemoryStore(fixtureLoaderService.REMOTE_FIXTURES)
                .then(function(result){
                   console.log('memory storage loaded');
                  $scope.loadingFixtures = false;
                  return result;
                })
                .catch(function(reason) {
                  console.error(reason);
                  growl.error('Local databases and memory storage setup failed, contact support.', {ttl: -1});
                  return reason;
                });
            };
            return storageService.clear()
              .then(loadRemoteFixture)
              .then(loadAppFacilityProfile)
              .catch(function(error) {
                growl.error('Fresh install setup failed, please contact support.', {ttl: -1});
                console.error(error);
                return error;
              });
          }

        })
        .catch(function(error) {
          growl.error('loading of App. Config. failed, please contact support.', {ttl: -1});
          console.error(error);
        });
    }
    function ccuProfilesGroupedByCategory () {
      $q.when(ccuProfileFactory.getAllGroupedByCategory())
        .then(function(result){
          $scope.ccuProfilesCategories = Object.keys(result);
          $scope.ccuProfilesGroupedByCategory = result;
        });
    }
    function productProfilesGroupedByCategory () {
      $q.when(productProfileFactory.getAllGroupedByCategory())
        .then(function(result){
          $scope.productProfileCategories = Object.keys(result);
          $scope.productProfilesGroupedByCategory = result;
        });
    }


    //TODO: load state id dynamically.
    function loadLgas (){
      return locationService.getLgas("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        return $scope.lgaList = res;
      })
      .catch(function(err) {
        return console.error(err);
      });
    }


    $scope.currentStep = $scope.STEP_ONE; //set initial step

   function loadZones(){
     $scope.zones = [];
     return locationService.getZones("f87ed3e017cf4f8db26836fd910e4cc8")
      .then(function(res) {
        return $scope.zones = res;
      })
      .catch(function(err) {
        return console.error(err);
      });
   }


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

    $scope.onLgaSelection = function(lga){

      appConfigService.getSelectedFacility((JSON.parse(lga)).uuid, event);
      $scope.appConfig.facility.selectedLgas =
        utility.addObjectToCollection(lga, $scope.appConfig.facility.selectedLgas, '_id');
      $scope.preSelectLgaCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedLgas, '_id');
    };
    $scope.onZoneSelection = function(zone){
      console.log($scope.appConfig.facility);
      $scope.appConfig.facility.selectedZones = utility.addObjectToCollection(zone, $scope.appConfig.facility.selectedZones, '_id');
      $scope.preSelectZoneCheckBox = utility.castArrayToObject($scope.appConfig.facility.selectedZones, '_id');

    };
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

    $scope.addSerialNumber = function() {
      var ccuItemID = Object.keys($scope.selectedCCEItem)[0];
      var ccuProfile = $scope.preSelectCcuProfiles[ccuItemID];
      ccuProfile.serialNumbers = ccuProfile.serialNumbers || [];
      $scope.errorMsg[ccuItemID] = '';

      if (ccuProfile.serialNumbers.indexOf($scope.serialNumber[ccuItemID]) !== -1) {
        $scope.errorMsg[ccuItemID] = 'Duplicate entry! serial already exist';
        return;
      }

      if ($scope.serialNumber[ccuItemID] === '' || angular.isUndefined($scope.serialNumber[ccuItemID]) ||
        ccuProfile.serialNumbers.indexOf($scope.serialNumber[ccuItemID]) !== -1) {
        return;
      }

      ccuProfile.serialNumbers.push($scope.serialNumber[ccuItemID]);
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');

      $scope.serialNumber[ccuItemID] = '';
    };

    $scope.removeSerial = function(ccuProfile, index) {
      $scope.errorMsg[ccuProfile.dhis2_modelid] = '';
      var confirmationTitle = 'Remove Serial Number';
      var confirmationQuestion = i18n('dialogConfirmationQuestion');
      var buttonLabels = [i18n('yes'), i18n('no')];

      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function(isConfirmed) {
          if (isConfirmed === true) {
            ccuProfile.serialNumbers.splice(index, 1);
          }
        })
        .catch(function(reason) {

        });
    };

    function resetRowState() {
      $scope.selectedCCEItem = {};
    }

    function toggleRow(ccuProfile) {
      $scope.errorMsg[ccuProfile.dhis2_modelid] = '';
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
    resetRowState();

  })
  .controller('EditAppConfigCtrl', function($scope, fixtureLoaderService, locationService, $rootScope, appConfigService, growl, $log, i18n, $state, appConfig, ccuProfilesGroupedByCategory, productProfilesGroupedByCategory, utility, alertFactory, $filter, notificationService) {

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
    $scope.errorMsg = {};


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
      $scope.errorMsg[ccuItemID] = '';

      if (ccuProfile.serialNumbers.indexOf($scope.serialNumber[ccuItemID]) !== -1) {
        $scope.errorMsg[ccuItemID] = 'Duplicate entry! serial already exist';
        return;
      }

      if ($scope.serialNumber[ccuItemID] === '' || angular.isUndefined($scope.serialNumber[ccuItemID]) ||
        ccuProfile.serialNumbers.indexOf($scope.serialNumber[ccuItemID]) !== -1) {
        return;
      }

      ccuProfile.serialNumbers.push($scope.serialNumber[ccuItemID]);
      $scope.preSelectCcuProfiles = utility.castArrayToObject($scope.appConfig.selectedCcuProfiles, 'dhis2_modelid');

      $scope.serialNumber[ccuItemID] = '';
    };

    $scope.removeSerial = function(ccuProfile, index) {
      $scope.errorMsg[ccuProfile.dhis2_modelid] = '';
      var confirmationTitle = 'Remove Serial Number';
      var confirmationQuestion = i18n('dialogConfirmationQuestion');
      var buttonLabels = [i18n('yes'), i18n('no')];

      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function(isConfirmed) {
          if (isConfirmed === true) {
            ccuProfile.serialNumbers.splice(index, 1);
          }
        })
        .catch(function(reason) {

        });
    };

    function resetRowState() {
      $scope.selectedCCEItem = {};
    }

    function toggleRow(ccuProfile) {
      $scope.errorMsg[ccuProfile.dhis2_modelid] = '';
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
    resetRowState();

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
            if (forSerial) {
              growl.success(i18n('appConfigSuccessMsg'));
            }
            if (!forSerial) {
              $scope.appConfig = result;
              alertFactory.success(i18n('appConfigSuccessMsg'));
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

  })
  .controller('appConfigAuth', function($scope, appConfigService, deviceEmail){
    $scope.appConfig = {
      uuid: deviceEmail,
      facility: { },
      contactPerson: {
        name: '',
        phoneNo: ''
      },
      selectedCcuProfiles: [],
      dateActivated: undefined
    };


  });
