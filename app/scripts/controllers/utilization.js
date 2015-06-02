angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
    .state('utilization', {
      parent: 'root.index',
      url: 'utilization',
      templateUrl: 'views/utilization/index.html',
      controller: 'UtilizationCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        }
      }
    })
    .state('utilization-entry', {
      parent: 'root.index',
      url: 'utilization-entry?uuid&index',
      templateUrl: 'views/utilization/form.html',
      controller: 'UtilizationFormCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        }
      }
    });
  })
  .controller('UtilizationCtrl', function($scope, utilizationService, appConfig, utility, $state) {
    $scope.utilization = [];
    $scope.selectedRecord = {};
    utilizationService.all()
      .then(function(record) {
        $scope.utilization = record;
      })
      .catch(function(reason) {

      });

    $scope.showDetail = function(index) {
      $scope.selectedRecord = $scope.utilization[index];
      $scope.detailView = true;
    };

    $scope.editProduct = function(index){
      $state.go('utilization-entry', {
        uuid: $scope.selectedRecord.uuid,
        index: index
      });
    };

    $scope.toggleView = function() {
      $scope.detailView = !$scope.detailView;
    };

    $scope.selectedProductProfiles = appConfig.facility.selectedProductProfiles;
    $scope.facilityProducts = utilizationService.filterAntigens(utility.castArrayToObject($scope.selectedProductProfiles, 'uuid'));
    $scope.facilityProductsUUIDs = Object.keys($scope.facilityProducts);


  })
  .controller('UtilizationFormCtrl', function($scope, utilizationService, appConfig, utility, $stateParams, $state) {

    var id = $stateParams.uuid || null;
    $scope.step = $stateParams.index || 0;
    $scope.dateInfo = new Date().toJSON();
    $scope.preview = false;
    $scope.endOfList = false;
    $scope.selectedProductProfiles = appConfig.facility.selectedProductProfiles;
    $scope.facilityProducts = utilizationService.filterAntigens(utility.castArrayToObject($scope.selectedProductProfiles, 'uuid'));
    $scope.facilityProductsUUIDs = Object.keys($scope.facilityProducts);
    var max = $scope.max = $scope.facilityProductsUUIDs.length - 1;
    $scope.utilization = {
      products: {},
      facility: appConfig.facility.uuid,
      isComplete: false
    };

    updateUI();

    if (id) {
      utilizationService.get(id)
        .then(function(record) {
          if (record) {
            $scope.utilization = record;
          }
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    function updateUI() {
      if (!$scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]]) {
        $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]] = {};
      }

      if ($scope.preview) {
        $scope.endOfList = true;
      }
    }

    $scope.changeStep = function(type) {

      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]] =
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]]);

      if (type === 'next' && $scope.step < max) {
        $scope.step ++;
      }
      if (type === 'prev' && $scope.step >= 1) {
        $scope.step --;
      }
      updateUI();
    };

    $scope.save = function() {
      if (!$scope.utilization.date) {
        $scope.utilization.date = new Date().toJSON();
      }
      $scope.utilization.isComplete = true;
      utilizationService.save($scope.utilization)
        .then(function() {
          $state.go('utilization');
        })
        .catch(function(reason) {
          console.log(reason);
        });
    };

    function validate(productObject) {
      ['balance', 'received', 'used', 'endingBalance', 'returned']
        .forEach(function(key) {
          if (productObject[key] === undefined) {
            productObject[key] = 0;
          }
        });

      return productObject;
    }

    $scope.togglePreview = function() {
      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]] =
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]]);
      $scope.preview = !$scope.preview;
      updateUI();
    };

    $scope.editProduct = function(index) {
      $scope.step = index;
      $scope.preview = false;
      updateUI();
    };

  });
