'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('logBundleHome', {
        parent: 'root.index',
        url: '/log-bundle-home?type',
        templateUrl: '/views/bundles/index.html',
        controller: 'LogBundleHomeCtrl',
        resolve: {
          bundles: function(bundleService) {
            return bundleService.getAll();
          }
        }
      })
      .state('logBundle', {
        parent: 'root.index',
        url: '/log-bundle?type&preview&uuid',
        templateUrl: '/views/bundles/log-incoming.html',
        controller: 'LogBundleCtrl',
        resolve: {
          appConfig: function(appConfigService) {
            return appConfigService.getCurrentAppConfig();
          }
        }
      });
  })
  .controller('LogBundleHomeCtrl', function($scope, $stateParams, bundleService, bundles, $state, utility, productProfileFactory, growl, i18n) {

    var logIncoming = bundleService.INCOMING;
    var logOutgoing = bundleService.OUTGOING;

    if ($stateParams.type !== logIncoming && $stateParams.type !== logOutgoing) {
      $state.go('home.index.home.mainActivity');
      growl.error(i18n('specifyBundleType'));
      return;
    }

    function setUITexts(type) {
      if ($stateParams.type === logIncoming) {
        $scope.logBundleTitle = i18n('IncomingDelivery');
        $scope.facilityHeader = i18n('receivedFrom');
        $scope.previewFacilityLabel = i18n('receivedFrom');
      } else if ($stateParams.type === logOutgoing) {
        $scope.logBundleTitle = i18n('OutgoingDelivery');
        $scope.facilityHeader = i18n('sentTo');
        $scope.previewFacilityLabel = i18n('sentTo');
      } else {
        $scope.logFormTitle = i18n('unknownBundleType');
      }
    };

    setUITexts($stateParams.type);

    $scope.showLogBundleForm = function() {
      $state.go('logBundle', { type: $stateParams.type });
    };
    $scope.bundles = bundles.filter(function(e) {
      return e.type === $stateParams.type;
    });
    $scope.bundles = utility.castArrayToObject($scope.bundles, '_id');
    $scope.previewBundle = {};
    $scope.preview = false;

    $scope.showBundle = function(bundle) {
      for (var i in bundle.bundleLines) {
        var ppUuid = bundle.bundleLines[i].productProfile;
        bundle.bundleLines[i].productProfile = productProfileFactory.get(ppUuid);
      }
      $scope.previewBundle = bundle;
      if ($stateParams.type === logIncoming) {
        $scope.previewBundle.facility = bundle.sendingFacility;
      } else if ($stateParams.type === logOutgoing) {
        $scope.previewBundle.facility = bundle.receivingFacility;
      }
      $scope.preview = true;
    };

    $scope.hidePreview = function() {
      $scope.preview = false;
    };

  })
  .controller('LogBundleCtrl', function($scope, appConfig, i18n, productProfileFactory, bundleService, growl, $state, alertFactory, syncService, $stateParams, $filter, locationService, facilityFactory) {

    var logIncoming = bundleService.INCOMING;
    var logOutgoing = bundleService.OUTGOING;
    $scope.lgas = [];
    $scope.wards = [];
    $scope.selectedLGA = '';
    $scope.selectedWard = '';
    $scope.wards = [];
    $scope.facilities = [];
    $scope.isSaving = false;
    $scope.selectedProductBaseUOM = {};
    $scope.selectedProductUOMName = {};
    $scope.calcedQty = {};
    $scope.selectedProductUOMVal = {};

    $scope.getUnitQty = function(selectedUUID, qty) {
      $scope.productProfiles.map(function(product) {
        if (product.uuid === selectedUUID) {
          $scope.selectedProductBaseUOM[product.uuid] = product.product.base_uom.name;
          $scope.selectedProductUOMName[product.uuid] = product.presentation.uom.name;
          $scope.selectedProductUOMVal[product.uuid] = product.presentation.value;
        }
      });
    };

    $scope.getWards = function(lga) {
      locationService.getWards(lga)
        .then(function(wards) {
          $scope.wards = wards;
        });
    };

    var getLGAs = function() {
      $scope.lgas = appConfig.facility.selectedLgas;
    };

    getLGAs();

    $scope.getFacilities = function(ward) {
      ward = JSON.parse(ward);
      facilityFactory.getFacilities(ward.facilities)
        .then(function(facilities) {
          $scope.facilities = facilities;
        });
    };

    $scope.goodToGo = function(bundlineForm, field) {
      return bundlineForm.$error[field]
    };

    if ($stateParams.type !== logIncoming && $stateParams.type !== logOutgoing) {
      $state.go('home.index.home.mainActivity');
      growl.error(i18n('specifyBundleType'));
      return;
    }
    $scope.placeholder = {
      selectedFacility: ''
    };
    $scope.previewFacilityLabel = '';

    function setUIText(type) {
      var today = $filter('date')(new Date(), 'dd MMM, yyyy')
      if ($stateParams.type === logIncoming) {
        $scope.logBundleTitle = [i18n('IncomingDelivery'), '-', today].join(' ');
        $scope.selectFacility = i18n('selectSender');
        $scope.previewFacilityLabel = i18n('sentTo');
        $scope.LGALabel = "Select sending LGA";
        $scope.WardLabel = "Select sending ward";
      } else if ($stateParams.type === logOutgoing) {
        $scope.logBundleTitle = [i18n('OutgoingDelivery'), '-', today].join(' ');
        $scope.selectFacility = i18n('selectReceiver');
        $scope.previewFacilityLabel = i18n('receivedFrom');
        $scope.LGALabel = "Select receiving lga";
        $scope.WardLabel = "Select receiving ward";
      } else {
        $scope.logFormTitle = i18n('unknownBundleType');
      }
    }

    setUIText($stateParams.type);

    $scope.productProfiles = productProfileFactory.getAll();
    $scope.batches = [];
    var id = 0;
    $scope.previewBundle = {};
    $scope.previewForm = false;
    $scope.bundle = {
      type: $stateParams.type,
      receivedOn: new Date().toJSON(),
      receivingFacility: {},
      bundleLines: []
    };
    $scope.bundle.bundleLines.push({
      id: id++,
      batchNo: '',
      productProfile: ''
    });

    $scope.addNewLine = function() {
      $scope.bundle.bundleLines.push({
        id: id++,
        batchNo: '',
        productProfile: ''
      });
    };
    $scope.removeLine = function(bundleLine) {
      $scope.bundle.bundleLines = $scope.bundle.bundleLines.filter(function(line) {
        return line.id !== bundleLine.id;
      });
    };

    $scope.isSelectedFacility = function(fac) {
      //TODO: refactor
      var sendingFacObj = $scope.bundle.sendingFacility;
      if (angular.isDefined(sendingFacObj) && angular.isDefined(fac)) {
        if (angular.isString(sendingFacObj) && sendingFacObj.length > 0) {
          sendingFacObj = JSON.parse(sendingFacObj);
        }
        return sendingFacObj.uuid === fac.uuid;
      }
      return false;
    };

    var updateBundleLines = function(bundle) {
      for (var i in bundle.bundleLines) {
        var ppUuid = bundle.bundleLines[i].productProfile;
        bundle.bundleLines[i].productProfile = productProfileFactory.get(ppUuid);
      }
      return bundle;
    };

    $scope.preview = function() {
      //TODO: Validate bundle obj and show preview if valid.
      //TODO: create new facility obj for preview from uuid, hence no need to track currently selected facility.
      $scope.previewForm = true;
      $scope.previewBundle = angular.copy($scope.bundle);
      if ($stateParams.type === logIncoming) {
        $scope.previewBundle.facility = $scope.bundle.sendingFacility;
      } else if ($stateParams.type === logOutgoing) {
        $scope.previewBundle.facility = $scope.bundle.receivingFacility;
      }
      updateBundleLines($scope.previewBundle);
    };

    $scope.setFacility = function() {
      var selectedFacility = $scope.placeholder.selectedFacility;
      if (selectedFacility === '') {
        return;
      }
      if ($stateParams.type === logIncoming) {
        $scope.bundle.sendingFacility = JSON.parse(selectedFacility);
        $scope.bundle.receivingFacility = appConfig.facility;
      } else if ($stateParams.type === logOutgoing) {
        $scope.bundle.receivingFacility = JSON.parse(selectedFacility);
        $scope.bundle.sendingFacility = appConfig.facility;
      } else {
        growl.error(i18n('unknownBundleType'));
      }
    };

    $scope.disableSave = function() {
      return $scope.bundle.bundleLines.length === 0 || $scope.placeholder.selectedFacility === '';
    };

    $scope.showForm = function() {
      $scope.previewForm = false;
    };

    $scope.finalSave = function() {
      var bundle = angular.copy($scope.bundle);
      $scope.isSaving = true;
      bundle.receivingFacility = bundle.receivingFacility.uuid;
      bundle.sendingFacility = bundle.sendingFacility.uuid;

      bundleService.save(bundle)
        .then(function() {
          syncService.syncUpRecord(bundleService.BUNDLE_DB, bundle)
            .finally(function() {
              var successMsg = '';
              if ($stateParams === logIncoming) {
                successMsg = 'Incoming bundle logged successfully.'
              } else {
                successMsg = 'Outgoing bundle logged successfully.'
              }
              alertFactory.success(successMsg);
              $state.go('home.index.home.mainActivity');
              $scope.isSaving = false;
            });
        })
        .catch(function(error) {
          console.error(error);
          growl.error('Save incoming bundle failed, contact support.');
          $scope.isSaving = false;
        });
    };
    $scope.spit = function(d) {
      console.log(d)
    }

  });

