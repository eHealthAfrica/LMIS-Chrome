angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
    .state('summary-sheet', {
      parent: 'root.index',
      url: 'summary-sheet?uuid&index',
      templateUrl: 'views/immunization-summary/summary-sheet.html',
      controller: 'SummarySheetCtrl',
      controllerAs: 'SummarySheetCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        }
      }
    })
    .state('summary-sheet-form', {
      parent: 'root.index',
      url: 'summary-sheet-form?id&index',
      templateUrl: 'views/immunization-summary/summary-sheet-form.html',
      controller: 'SummarySheetFormCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        }
      }
    });
  })
  .controller('SummarySheetCtrl', function($scope, appConfig, utility, $stateParams, $state, immunizationSummaryService,
                                           growl, notificationService, i18n) {
    $scope.summaryRecord = [];
    $scope.summarySetting = {
      facility: appConfig.facility.uuid,
      products: []
    };

    $scope.viewControl = {
      settingMode: false,
      pageTitle: 'Immunization Summaries',
      date: new Date().toJSON(),
      previewMode: false,
      product: {
        ageRange: {}
      },
      productFields: ['name', 'fromPeriod', 'from', 'toPeriod', 'to'],
      pregnancyStatus: {'Yes': 'Pregnant', 'No': 'Not Pregnant'},
      selectedRecord: {}
    };

    loadSetting();

    immunizationSummaryService.all()
      .then(function(response) {
        $scope.summaryRecord = response;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    function loadSetting() {
      immunizationSummaryService.getSetting()
        .then(function(settings) {
          $scope.summarySetting = settings;
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    function toggleSettingMode() {
      $scope.viewControl.settingMode = !$scope.viewControl.settingMode;
    }

    function editProduct(index) {
      $scope.step = index;
      $scope.viewControl.previewMode = false;
    }

    function togglePreview() {
      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]] =
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]]);
      $scope.$scope.viewControl.previewMode = !$scope.$scope.viewControl.previewMode;
    }

    function goBack() {
      if ($scope.viewControl.settingMode) {
        saveSetting();
      }
      $scope.viewControl.previewMode = false;
      $scope.viewControl.settingMode = false;
    }

    function validate(object) {
      var failed = {};
      $scope.viewControl.productFields
        .forEach(function(key) {
          if (angular.isUndefined(object[key]) || object[key] === '') {
            failed[key] = 'this field is required';
          }
        });
      return failed;
    }

    $scope.summaryDetail = function(index) {
      $scope.viewControl.selectedRecord = $scope.summaryRecord[index];
      $scope.viewControl.previewMode = true;
    };

    $scope.add = function() {
      if (!utility.isEmptyObject(validate($scope.viewControl.product))) {
        growl.error('can not submit form due to errors');
        return;
      }
      if (!$scope.viewControl.product.uuid) {
        $scope.viewControl.product.uuid = utility.uuidGenerator();
      }
      $scope.summarySetting.products.push($scope.viewControl.product);
      $scope.viewControl.product = {};
      growl.success('Setting saved successfully');
    };

    $scope.removeProduct = function(index) {


      var confirmationTitle = 'Remove Product';
      var confirmationQuestion = i18n('dialogConfirmationQuestion');
      var buttonLabels = [i18n('yes'), i18n('no')];

      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function(isConfirmed) {
          if (isConfirmed === true) {
            $scope.summarySetting.products.splice(index, 1);
          }
        })
        .catch(function(reason) {
          console.info(reason);
        });
    };

    function saveSetting() {
      immunizationSummaryService.saveSetting($scope.summarySetting)
        .then(function (settings) {

        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    $scope.toggleView = function(type) {
      switch(type) {
        case 'settings':
          toggleSettingMode();
          break;
        case 'back':
          goBack();
          break;
      }
    };

  })
  .controller('SummarySheetFormCtrl', function($scope, appConfig, utility, $stateParams, $state, immunizationSummaryService,
                                               i18n, notificationService) {
    var id = $stateParams.id, index = $stateParams.index;

    $scope.summaryRecord = {
      date: new Date().toJSON(),
      products: {}
    };
    $scope.summarySetting = {
      facility: appConfig.facility.uuid,
      products: []
    };

    $scope.viewControl = {
      max: 0,
      step: index || 0,
      preview: false,
      sessionFormOpen: true,
      pregnancyStatus: {'Yes': 'Pregnant', 'No': 'Not Pregnant'}
    };

    if (id) {
      console.log(id);
      immunizationSummaryService.get(id)
        .then(function(response) {
          $scope.summaryRecord = response;
          console.log(response);
          if (!$scope.summaryRecord.date) {
            $scope.summaryRecord.date = new Date().toJSON();
          }
        })
    }

    immunizationSummaryService.getSetting()
      .then(function(settings) {
        $scope.summarySetting = settings;
        $scope.viewControl.max = settings.products.length - 1;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    $scope.changeStep = function(type) {
      validate($scope);
      if (type === 'next' && $scope.viewControl.step < $scope.viewControl.max) {
        $scope.viewControl.step ++;
      }
      if (type === 'prev' && $scope.viewControl.step >= 1) {
        $scope.viewControl.step --;
      }
      updateUI();
    };

    $scope.togglePreview = function() {
      $scope.viewControl.preview = !$scope.viewControl.preview;
      updateUI();
    };

    $scope.edit = function(index) {
      $scope.viewControl.step = index;
      $scope.viewControl.preview = false;
    };

    $scope.save = function() {
      immunizationSummaryService.save($scope.summaryRecord)
        .then(function() {
          $state.go('summary-sheet');
        })
        .catch(function(reason) {
          console.log(reason);
        });
    };

    function updateUI() {
      var key = $scope.summarySetting.products[$scope.viewControl.step].uuid;
      if (!$scope.summaryRecord.products[key]) {
        $scope.summaryRecord.products[key] = 0;
      }

      if ($scope.viewControl.preview) {
        $scope.viewControl.endOfList = true;
      }
    }

    function validate(scope) {
      var id = scope.summarySetting.products[scope.viewControl.step].uuid;
      if (angular.isUndefined(scope.summaryRecord.products[id])) {
        scope.summaryRecord.products[id] = 0;
      }
    }

  });
