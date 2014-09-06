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
          },
          batchStore: function(batchService) {
            return batchService.getBatchNos()
              .catch(function() {
                return {};
              });
          },
          bundles: function(bundleService) {
            return bundleService.getAll();
          }
        }
      });
  })
  .controller('LogBundleHomeCtrl', function($scope, $stateParams, bundleService, bundles, $state, utility, productProfileFactory, growl, i18n,expiredProductAlertService) {

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

    $scope.bundles = bundles
      .filter(function(e) {
        //TODO: move to service getByType()
        return e.type === $stateParams.type;
      })
      .sort(function(a, b) {
        //desc order
        return -(new Date(a.created) - new Date(b.created));
      });
    $scope.previewBundle = {};
    $scope.preview = false;

    $scope.showBundle = function(bundle) {
      for (var i in bundle.bundleLines) {
        var ppUuid = bundle.bundleLines[i].productProfile;
        bundle.bundleLines[i].productProfile = productProfileFactory.get(ppUuid);
      }
      $scope.previewBundle = angular.copy(bundle);
      $scope.preview = true;
    };

    $scope.hidePreview = function() {
      $scope.preview = false;
    };
    $scope.expiredProductAlert = expiredProductAlertService.compareDates;

  })
  .controller('LogBundleCtrl', function($scope, batchStore, utility, batchService, appConfig, i18n, productProfileFactory, bundleService, growl, $state, alertFactory, syncService, $stateParams, $filter, locationService, facilityFactory,appConfigService, expiredProductAlertService) {

    $scope.batchNos = Object.keys(batchStore);

    $scope.hideFavFacilities = function() {
      $scope.showAddNew = true;
    };

    $scope.updateBatchInfo = function(bundleLine) {
      var batch;
      if (bundleLine.batchNo) {
        batch = batchStore[bundleLine.batchNo];
        if (angular.isObject(batch)) {
          bundleLine.productProfile = batch.profile;
          bundleLine.expiryDate = batch.expiryDate;
          $scope.getUnitQty(bundleLine);
        }
      }
    };

    $scope.updateUnitQty = function(uom, count, bundleLine) {
      bundleLine.quantity = uom * count;

    };

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

    $scope.getUnitQty = function(bundleLine) {
      $scope.productProfiles.map(function(product) {
        if (product.uuid === bundleLine.productProfile) {
          $scope.selectedProductBaseUOM[bundleLine.id] = product.product.base_uom.name;
          $scope.selectedProductUOMName[bundleLine.id] = product.presentation.uom.name;
          $scope.selectedProductUOMVal[bundleLine.id] = product.presentation.value;
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
        $scope.previewFacilityLabel = i18n('receivedFrom');
        $scope.LGALabel = i18n('selectSendingLga');
        $scope.WardLabel = i18n('selectSendingWard');
      } else if ($stateParams.type === logOutgoing) {
        $scope.logBundleTitle = [i18n('OutgoingDelivery'), '-', today].join(' ');
        $scope.selectFacility = i18n('selectReceiver');
        $scope.previewFacilityLabel = i18n('sendTo');
        $scope.LGALabel = i18n('selectReceivingLga');
        $scope.WardLabel = i18n('selectReceivingWard');
      } else {
        $scope.logFormTitle = i18n('unknownBundleType');
      }
    }

    setUIText($stateParams.type);
    bundleService.getRecentFacilityIds($stateParams.type)
      .then(function(res) {
        facilityFactory.getFacilities(res)
          .then(function(facilities) {
            $scope.recentFacilities = facilities;
          });
      })
      .catch(function(err) {
        console.error(err);
      });
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
        $scope.previewBundle.facilityName = $scope.bundle.sendingFacility.name;
      } else if ($stateParams.type === logOutgoing) {
        $scope.previewBundle.facilityName = $scope.bundle.receivingFacility.name;
      }
      updateBundleLines($scope.previewBundle);
    };

    $scope.setFacility = function() {
      var selectedFacility = $scope.placeholder.selectedFacility;
      if (selectedFacility === '' || angular.isUndefined(selectedFacility)) {
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
      var successMsg = '';
      if ($stateParams.type === logIncoming) {
        successMsg = i18n('incomingDeliverySuccessMessage');
        bundle.facilityName = bundle.sendingFacility.name;
      } else {
        successMsg = i18n('outgoingDeliverySuccessMessage');
        bundle.facilityName = bundle.receivingFacility.name;
      }
      var newProductProfiles = [];
      bundle.bundleLines.forEach(function(bundleLine) {
        var i = 1;
        appConfig.facility.selectedProductProfiles.filter(function(product) {

          if (product.uuid === bundleLine.productProfile) {
            i = 0;
          }
        });
        if (i === 1) {
          newProductProfiles.push(bundleLine.productProfile);
        }

      });
      if (newProductProfiles.length > 0) {
        $scope.productProfiles.map(function(product) {
          if (newProductProfiles.indexOf(product.uuid) !== -1) {
            appConfig.facility.selectedProductProfiles.push(product);
          }
        });
        appConfigService.save(appConfig);
      }

      bundle.receivingFacility = bundle.receivingFacility.uuid;
      bundle.sendingFacility = bundle.sendingFacility.uuid;
      bundleService.save(bundle)
        .then(function() {
          syncService.syncUpRecord(bundleService.BUNDLE_DB, bundle)
            .finally(function() {
              alertFactory.success(successMsg);
              $state.go('home.index.home.mainActivity');
              $scope.isSaving = false;
              updateBatchInfo(bundle.bundleLines);
            });
        })
        .catch(function(error) {
          console.error(error);
          growl.error('Save incoming bundle failed, contact support.');
          $scope.isSaving = false;
        });
    };

    var updateBatchInfo = function(bundleLines) {
      var batches = batchService.extractBatch(bundleLines);
      var updatedBatches = batches
        .map(function(b) {
          var oldBatch = batchStore[b.batchNo];
          if (oldBatch) {
            b._id = oldBatch._id;
            b._rev = oldBatch._rev
            b.uuid = oldBatch.uuid
          }
          return b;
        });
      batchService.saveBatches(updatedBatches)
        .catch(function(err) {
          console.error(err);
        });
    }
    function validateBundle(bundleLine){
      var err = [];
      console.log($scope.bundle);
    }
    $scope.expiredProductAlert = expiredProductAlertService.compareDates;

  });

