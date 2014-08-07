'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('logIncomingHome', {
        parent: 'root.index',
        url: '/log-incoming-home',
        templateUrl: '/views/bundles/index.html',
        controller: 'LogIncomingHomeCtrl',
        resolve: {
          incomingBundles: function(bundleService){
            return bundleService.getAll();
          }
        },
        data: {
          label: 'Incoming Home'
        }
      })
      .state('logIncoming', {
      parent: 'root.index',
      url: '/log-incoming?preview&uuid',
      templateUrl: '/views/bundles/log-incoming.html',
      controller: 'LogIncomingCtrl',
      resolve: {
        appConfig: function(appConfigService){
          return appConfigService.getCurrentAppConfig();
        }
      },
      data: {
        label: 'Log Incoming'
      }
    });
  })
  .controller('LogIncomingHomeCtrl', function($scope, incomingBundles, $state, utility, productProfileFactory){
    $scope.incomingBundles = utility.castArrayToObject(incomingBundles, '_id');
    $scope.previewBundle = {};
    $scope.preview = false;

    $scope.showBundle = function(bundle) {
      for (var i in bundle.bundleLines) {
        var ppUuid = bundle.bundleLines[i].productProfile;
        bundle.bundleLines[i].productProfile = productProfileFactory.get(ppUuid);
      }
      $scope.previewBundle = bundle;
      $scope.preview = true;
    };

    $scope.hidePreview = function(){
      $scope.preview = false;
    };

  })
  .controller('LogIncomingCtrl', function($scope, appConfig, productProfileFactory, bundleService, growl, $state, alertFactory, $stateParams) {

    $scope.productProfiles = productProfileFactory.getAll();
    $scope.batches = [];
    var id = 0;
    $scope.previewBundle = {};
    $scope.previewForm = false;
    //TODO: pull real facility list
    $scope.facilities = [
      appConfig.facility
    ];
    $scope.bundle = {
      receivedOn: new Date().toJSON(),
      receivingFacility: appConfig.facility,
      bundleLines: []
    };

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

    $scope.isSelectedFacility =  function(fac){
      var sendingFacObj = $scope.bundle.sendingFacility;
      if(angular.isDefined(sendingFacObj) && angular.isDefined(fac)){
        if(angular.isString(sendingFacObj) && sendingFacObj.length > 0){
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

    $scope.preview = function(){
      //TODO: Validate bundle obj and show preview if valid.
      //TODO: create new facility obj for preview from uuid, hence no need to track currently selected facility.
      $scope.previewForm = true;
      $scope.previewBundle = angular.copy($scope.bundle);
      $scope.previewBundle.sendingFacility = JSON.parse($scope.previewBundle.sendingFacility);
      updateBundleLines($scope.previewBundle);
    };

    $scope.disableSave = function(){
      return $scope.bundle.bundleLines.length === 0 || $scope.bundle.sendingFacility.length === 0;
    };

    $scope.showForm = function(){
      $scope.previewForm = false;
    };

    $scope.finalSave = function(){
      var bundle = angular.copy($scope.bundle);
      bundle.sendingFacility = JSON.parse(bundle.sendingFacility);
      bundleService.save(bundle)
        .then(function() {
          alertFactory.success('Incoming bundle logged successfully.');
          $state.go('home.index.home.mainActivity');
          //TODO: sync
        })
        .catch(function(error) {
          console.error(error);
          growl.error('Save incoming bundle failed, contact support.');
        });
    };

  });

