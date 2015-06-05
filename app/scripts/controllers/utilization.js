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
        },
        utilizationList: function (utilizationService) {
          return utilizationService.all();
        }
      }
    });
  })
  .controller('UtilizationCtrl', function($scope, utilizationService, appConfig, utility, $state) {
    $scope.viewControl = {
      pages: {
        index: {
          title: ''
        },
        preview: {
          title: 'Report Preview',
          parent: 'index'
        }
      },
      page: 'index',
      reportExistToday: false
    };
    $scope.utilization = {};
    $scope.utilizationList = [];

    utilizationService.all()
      .then(function(record) {
        $scope.utilizationList = record;
      })
      .catch(function(reason) {

      });

    $scope.showDetail = function(index) {
      $scope.utilization = $scope.utilizationList[index];
      $scope.viewControl.page = 'preview';
    };

    $scope.editProduct = function(index){
      $state.go('utilization-entry', {
        uuid: $scope.utilization.uuid,
        index: index
      });
    };

    $scope.currentPage = function(page) {
      return $scope.viewControl.page === page;
    };

    $scope.showButton = function(button) {
      var condition = false;
      var page = $scope.viewControl.page;
      var buttons = {
        add: ['index'],
        edit: ['preview']
      };

      if (buttons[button]) {
        condition = buttons[button].indexOf(page) !== -1;
      }

      return condition;
    };

    $scope.navBack = function() {
      var page = $scope.viewControl.page;
      var currentPage = $scope.viewControl.pages[page];
      var parent = 'index';

      if (currentPage) {
        parent = currentPage.parent || parent;
      }

      $scope.viewControl.page = page;
    };

    $scope.selectedProductProfiles = appConfig.facility.selectedProductProfiles;
    $scope.facilityProducts = utilizationService.filterAntigens(utility.castArrayToObject($scope.selectedProductProfiles, 'uuid'));
    $scope.facilityProductsUUIDs = Object.keys($scope.facilityProducts);

  })
  .controller('UtilizationFormCtrl', function($scope, utilizationService, appConfig, utility, $stateParams, $state, utilizationList) {

    var id = $stateParams.uuid || null;
    $scope.viewControl = {
      step:  $stateParams.index || 0,
      max: 0,
      endOfList: false,
      pages: {
        form: {
          title: ''
        },
        preview: {
          title: 'Report Preview',
          parent: 'index'
        }
      },
      page: 'form',
      validationError: {},
      balanceEdited: {},
      editedFigure: {}
    };

    $scope.currentPage = function(page) {
      return $scope.viewControl.page === page;
    };

    $scope.showButton = function(button) {
      var condition = false;
      var page = $scope.viewControl.page;
      var buttons = {
        save: ['preview']
      };

      if (buttons[button]) {
        condition = buttons[button].indexOf(page) !== -1;
      }

      return condition;
    };

    $scope.navBack = function() {
      var page = $scope.viewControl.page;
      var currentPage = $scope.viewControl.pages[page];
      var parent = 'form';

      if (currentPage) {
        parent = currentPage.parent || parent;
      }

      $scope.viewControl.page = page;
    };

    $scope.selectedProductProfiles = appConfig.facility.selectedProductProfiles;
    $scope.facilityProducts = utilizationService.filterAntigens(utility.castArrayToObject($scope.selectedProductProfiles, 'uuid'));
    $scope.facilityProductsUUIDs = Object.keys($scope.facilityProducts);
    var max = $scope.viewControl.max = $scope.facilityProductsUUIDs.length - 1;
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

    $scope.changeStep = function(type) {

      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]] =
        utilizationService.validateEntry($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]]);

      if (type === 'next' && $scope.viewControl.step < max) {
        $scope.viewControl.step ++;
      }
      if (type === 'prev' && $scope.viewControl.step >= 1) {
        $scope.viewControl.step --;
      }
      updateUI();
    };

    $scope.save = function() {
      if (!$scope.utilization.date) {
        $scope.utilization.date = new Date().toJSON();
      }
      $scope.utilization.isComplete = true;
      $scope.utilization.balanceEdited = $scope.viewControl.balanceEdited;
      utilizationService.save($scope.utilization)
        .then(function() {
          $state.go('utilization');
        })
        .catch(function(reason) {
          console.log(reason);
        });
    };

    $scope.showPreview = function() {
      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]] =
        utilizationService.validateEntry($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]]);
      $scope.viewControl.page = 'preview';
      updateUI();
    };

    $scope.editProduct = function(index) {
      $scope.viewControl.step = index;
      $scope.preview = false;
      updateUI();
    };

    $scope.updateRecords = function(button) {

      var step = $scope.viewControl.step;
      var uuid = $scope.facilityProductsUUIDs[step];

      if (validationSetup[button]) {
        validationSetup[button]();
      }

      if (['balance', 'used', 'received'].indexOf(button) !== -1) {
        if (!$scope.viewControl.validationError[button]) {
          $scope.utilization.products[uuid].endingBalance = utilizationService.getEndingBalance($scope.utilization.products[uuid]);
        }
      }
    };

    $scope.confirmBalance = function() {
      var step = $scope.viewControl.step;
      var uuid = $scope.facilityProductsUUIDs[step];
      $scope.viewControl.balanceEdited[uuid] = $scope.utilization.products[uuid].balance;
      $scope.utilization.products[uuid].balance = $scope.viewControl.editedFigure[uuid];
      $scope.viewControl.balanceEdited[uuid] =
      delete $scope.viewControl.validationError['balance'];
      delete $scope.viewControl.editedFigure[uuid];
    };

    function updateUI() {
      var step = $scope.viewControl.step;
      var uuid = $scope.facilityProductsUUIDs[step];

      if (!$scope.utilization.products[uuid]) {
        $scope.utilization.products[uuid] = {};
      }

      var previousBalance = utilizationService.getPreviousBalance(uuid, utilizationList);
      var currentBalance = $scope.utilization.products[uuid].balance;

      $scope.utilization.products[uuid].balance = currentBalance || previousBalance;

      if ($scope.viewControl.page === 'preview') {
        $scope.viewControl.endOfList = true;
      }
    }

    var validationSetup = {
      balance: function() {
        var step = $scope.viewControl.step;
        var uuid = $scope.facilityProductsUUIDs[step];
        var currentFigure = $scope.utilization.products[uuid].balance;
        var calculatedFigure =   utilizationService.getPreviousBalance(uuid, utilizationList);

        if (!$scope.viewControl.editedFigure[uuid] && !$scope.viewControl.balanceEdited[uuid] && calculatedFigure !== currentFigure) {
          $scope.viewControl.editedFigure[uuid] = currentFigure;
          $scope.utilization.products[uuid].balance = calculatedFigure;
          $scope.viewControl.validationError.balance = 'Please confirm change';
        } else {
          delete $scope.viewControl.validationError['balance'];
        }
      }
    };



  });
