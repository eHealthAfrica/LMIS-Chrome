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
        },
        utilizationList: function (utilizationService) {
          return utilizationService.all();
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
  .controller('UtilizationCtrl', function($scope, utilizationService, appConfig, utility, $state, utilizationList) {
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
    $scope.utilizationList = utilizationList;

    $scope.showDetail = function(index) {
      $scope.utilization = utilizationList[index];
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
  .controller('UtilizationFormCtrl', function($scope, utilizationService, appConfig, utility, $stateParams, $state, utilizationList, growl) {

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
          growl.error('Error Loading selected record ');
          console.log(reason);
        });
    }

    $scope.changeStep = function(type) {
      if (!utility.isEmptyObject($scope.viewControl.validationError[stateVar().step])) {
        growl.error('Kindly fix errors before proceeding');
        return;
      }

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
      if (!noPendingErrors()) {
        growl.error('Kindly fix errors before proceeding');
        return;
      }
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
          growl.error('Error saving record ');
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

      if (!$scope.viewControl.validationError[stateVar().step][button]) {
        $scope.utilization.products[uuid].endingBalance = utilizationService.getEndingBalance($scope.utilization.products[uuid]);
      }
    };

    $scope.confirmBalance = function(action) {
      var uuid = $scope.facilityProductsUUIDs[$scope.viewControl.step];
      if (action === 'confirm') {
        $scope.viewControl.balanceEdited[uuid] = $scope.utilization.products[uuid].balance;
        $scope.utilization.products[uuid].balance = $scope.viewControl.editedFigure[uuid];
      }

      delete $scope.viewControl.validationError[stateVar().step]['balance'];
      delete $scope.viewControl.editedFigure[uuid];
    };

    function updateUI() {

      var uuid = stateVar().uuid;
      $scope.viewControl.validationError[stateVar().step] = $scope.viewControl.validationError[stateVar().step] || {};
      $scope.utilization.products[uuid] = $scope.utilization.products[uuid] || {};

      var previousBalance = utilizationService.getPreviousBalance(uuid, utilizationList);
      var currentBalance = stateVar().record.balance;

      $scope.utilization.products[uuid].balance = currentBalance || previousBalance;
      $scope.utilization.products[uuid].endingBalance = utilizationService.getEndingBalance($scope.utilization.products[uuid]);

      if ($scope.viewControl.page === 'preview') {
        $scope.viewControl.endOfList = true;
      }
    }

    var validationSetup = {
      balance: function() {
        var uuid = stateVar().uuid;
        var currentFigure = stateVar().record.balance;
        var calculatedFigure =   utilizationService.getPreviousBalance(uuid, utilizationList);
        if (!$scope.viewControl.editedFigure[uuid] && !$scope.viewControl.balanceEdited[uuid] && calculatedFigure !== currentFigure) {
          $scope.viewControl.editedFigure[uuid] = currentFigure;
          $scope.utilization.products[uuid].balance = calculatedFigure;

          $scope.viewControl.validationError[stateVar().step].balance = 'Please confirm change';
        } else {
          delete $scope.viewControl.validationError[stateVar().step]['balance'];
        }
      },
      received: function() {
        validateInteger('received');
      },
      returned: function() {
        validateInteger('returned');
        if (!isValidEndingBalance()) {
          $scope.utilization.products[stateVar().uuid].returned = 0;
        }
      },
      used: function() {
        validateInteger('used');
        if (!isValidEndingBalance()) {
          $scope.utilization.products[stateVar().uuid].used = 0;
        }
      }
    };

    function stateVar() {
      var step = $scope.viewControl.step;
      var uuid = $scope.facilityProductsUUIDs[step];
      return {
        step: step,
        uuid: uuid,
        record: $scope.utilization.products[uuid]
      }
    }

    function isValidEndingBalance() {
      var endingBalance = utilizationService.getEndingBalance(stateVar().record);
      var state = true;
      if (endingBalance < 0) {
        state = false;
        growl.error('Kindly check entry, ending balance can\'t be negative' );
      }
      return state;
    }

    function validateInteger(action) {
      var value = stateVar().record[action] || 0;
      if (value < 0) {
        $scope.viewControl.validationError[stateVar().step][action] = 'Invalid entry, kindly fix entry';
      } else {
        delete $scope.viewControl.validationError[stateVar().step][action];
      }
    }

    function noPendingErrors() {
      var failed = 0;

      (Object.keys($scope.viewControl.validationError))
        .forEach(function(key) {
          if (!utility.isEmptyObject($scope.viewControl.validationError[key])) {
            failed ++;
          }
        });

      return failed === 0;
    }

  });
