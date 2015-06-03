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
      page: 'form'
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
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]]);

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
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]]);
      $scope.viewControl.page = 'preview';
      updateUI();
    };

    $scope.editProduct = function(index) {
      $scope.viewControl.step = index;
      $scope.preview = false;
      updateUI();
    };

    function updateUI() {
      if (!$scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]]) {
        $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.viewControl.step]] = {};
      }

      if ($scope.viewControl.page === 'preview') {
        $scope.viewControl.endOfList = true;
      }
    }

    function validate(productObject) {
      ['balance', 'received', 'used', 'endingBalance', 'returned']
        .forEach(function(key) {
          if (productObject[key] === undefined) {
            productObject[key] = 0;
          }
        });

      return productObject;
    }

    function getPreviousBalance() {
      var previousBalance = 0;
      var currentRecordUUID = $scope.facilityProductsUUIDs[$scope.viewControl.step];
      var currentRecord = $scope.utilization.products[currentRecordUUID] || {};
      var previousRecord = previousRecord(utilizationList);


      return 0;
    }

    function previousRecord(utilizationList) {
      var filtered = [];
      var selectedRecord = {};
      var previousDate = getRecordPreviousDate();
      if (utilizationList.length) {
        for (var i=0; i<=utilizationList.length; i++) {
          if (utility.getFullDate(utilizationList[i].date) === utility.getFullDate(previousDate)) {
            filtered.push(utilizationList[i]);
          }
        }
      }

      if (filtered.length) {
        selectedRecord = filtered[0];
      }

      return selectedRecord;
    }

    function getPreviousDate(date, subtract) {
      var currentDate = utility.isDate(date) ? new Date(date) : new Date();
      var previousDate = new Date(currentDate);
      subtract = subtract || 1;
      return new Date(previousDate.setDate(currentDate.getDate() - subtract));
    }

    function getRecordPreviousDate() {
      var weekends = [0, 6];
      var previousDate = getPreviousDate();

      if (weekends.indexOf(previousDate.getDate()) !== -1) {
        var subtract = previousDate.getDate() === 0 ? 2 : 1;
        return getPreviousDate(previousDate, subtract);
      }
      return previousDate;
    }

  });
