angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
    .state('summary-sheet', {
      parent: 'root.index',
      url: 'summary-sheet?uuid&index',
      templateUrl: 'views/immunization-summary/index.html',
      controller: 'SummarySheetCtrl',
      controllerAs: 'SummarySheetCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        },
        currentSummary: function(immunizationSummaryService) {
          return immunizationSummaryService.getCurrentSummarySessionTypes();
        }
      }
    })
    .state('summary-sheet-form', {
      parent: 'root.index',
      url: 'summary-sheet-form?id&index',
      templateUrl: 'views/immunization-summary/form.html',
      controller: 'SummarySheetFormCtrl',
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        },
        currentSummary: function(immunizationSummaryService) {
          return immunizationSummaryService.getCurrentSummarySessionTypes();
        },
        formSetting: function(immunizationSummaryService) {
          return immunizationSummaryService.getSetting();
        }
      }
    });
  })
  .controller('SummarySheetCtrl', function($scope, appConfig, utility, $stateParams, $state, immunizationSummaryService,
                                           growl, notificationService, i18n, currentSummary) {
    $scope.summaryRecords = [];
    $scope.summarySetting = {
      facility: appConfig.facility.uuid,
      products: [],
      formConfig: {}
    };

    $scope.viewControl = {
      pageTitle: 'Immunization Summaries',
      date: new Date().toJSON(),
      product: {
        ageRange: {}
      },
      currentSummary: currentSummary,
      productFields: ['name', 'fromPeriod', 'from', 'toPeriod', 'to'],
      pregnancyStatus: {'Yes': 'Pregnant', 'No': 'Not Pregnant'},
      selectedRecord: {},
      pages: {
        index: {
          title: 'Immunization Summary'
        },
        preview: {
          title: 'Summary Record Preview',
          parent: 'index'
        },
        setting: {
          title: 'Configure Form',
          parent: 'index'
        }
      },
      page: 'index'
    };

    loadSetting();

    immunizationSummaryService.all()
      .then(function(response) {
        $scope.summaryRecords = response;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    $scope.summaryDetail = function(index) {
      $scope.summaryRecord = $scope.summaryRecords[index];
      $scope.viewControl.page = 'preview';
    };

    $scope.currentPage = function(page) {
      return $scope.viewControl.page === page;
    };

    $scope.edit = function(index) {
      var confirmationTitle = 'Edit Summary Record';
      var confirmationQuestion = i18n('dialogConfirmationQuestion');
      var buttonLabels = [i18n('yes'), i18n('no')];

      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function(isConfirmed) {
          if (isConfirmed === true) {
            $state.go('summary-sheet-form', {
              id: $scope.summaryRecord.uuid,
              index: index
            });
          }
        })
        .catch(function(reason) {
          console.info(reason);
        });
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

    $scope.save = function() {
      saveSetting();
    };

    $scope.navBack = function() {
      var page = $scope.viewControl.page;
      var parent = 'index';
      var selected = $scope.viewControl.pages[page];

      if (selected) {
        parent = selected.parent || parent;
        $scope.viewControl.page = parent;
      }

    };

    $scope.showButton = function(button) {
      var condition = false;
      var buttons = {
        add: ['index'],
        setting: ['index'],
        save: ['setting'],
        edit: ['preview']
      };

      if (buttons[button]) {
        condition = buttons[button].indexOf($scope.viewControl.page) !== -1;
      }

      return condition;
    };

    function saveSetting() {
      immunizationSummaryService.saveSetting($scope.summarySetting)
        .then(function (settings) {
          $scope.viewControl.settingMode = false;
          growl.success('Settings saved');
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    function loadSetting() {
      immunizationSummaryService.getSetting()
        .then(function(settings) {
          $scope.summarySetting = settings;
          $scope.summarySetting.formConfig = settings.formConfig || {};
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    function show() {
      $scope.viewControl.page = 'setting';
    }

    function editProduct(index) {
      $scope.step = index;
    }

    function togglePreview() {
      $scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]] =
        validate($scope.utilization.products[$scope.facilityProductsUUIDs[$scope.step]]);
      $scope.$scope.viewControl.previewMode = !$scope.$scope.viewControl.previewMode;
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

  })
  .controller('SummarySheetFormCtrl', function($scope, appConfig, utility, $stateParams, $state, immunizationSummaryService,
                                               i18n, notificationService, currentSummary, formSetting) {
    var id = $stateParams.id, index = $stateParams.index;

    $scope.summaryRecord = {
      facility: appConfig.facility.uuid,
      date: new Date().toJSON(),
      products: {}
    };
    $scope.summarySetting = formSetting;
    if (!$scope.summarySetting.formConfig) {
      $scope.summarySetting.formConfig = {};
    }

    $scope.viewControl = {
      max: formSetting.products.length - 1,
      step: index || 0,
      pregnancyStatus: {'Yes': 'Pregnant', 'No': 'Not Pregnant'},
      validationError: {},
      groupProduct: [],
      pages: {
        summary: {
          title: 'Entry Breakdown',
          parent: 'preview'
        },
        preview: {
          title: 'Summary Record Preview'
        },
        sessionSelection: {
          title: 'Select Session'
        },
        groupSelection: {
          title: 'Select Stage',
          parent: 'sessionSelection'
        },
        ageRangeSelection: {
          title: 'Select Age Range',
          parent: 'groupSelection'
        },
        recordEntry: {
          title: 'Enter Vaccinated',
          parent: 'groupSelection'
        }
      },
      page: 'sessionSelection'
    };

    immunizationSummaryService.groupedProducts()
      .then(function(response) {
        $scope.viewControl.groupProduct = response;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    if (id) {
      immunizationSummaryService.get(id)
        .then(function(response) {
          $scope.summaryRecord = response;
          if (!$scope.summaryRecord.facility) {
            $scope.summaryRecord.facility = appConfig.facility.uuid;
          }
          if (!$scope.summaryRecord.date) {
            $scope.summaryRecord.date = new Date().toJSON();
          }
          currentSummary = updateSessionTypeList($scope.summaryRecord.sessionType, currentSummary);
          $scope.viewControl.page = index ? 'recordEntry' : 'preview';
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

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

    $scope.previewPage = function() {
      $scope.viewControl.page = 'preview';
      updateUI();
    };

    $scope.edit = function(index) {
      $scope.viewControl.step = index;
      $scope.viewControl.page = 'recordEntry';

      if (testProductStages().length > 1) {
        $scope.viewControl.selectedRadio = $scope.summarySetting.products[index].name + index;
      }
    };

    $scope.save = function() {
      $scope.summaryRecord.isComplete = true;
      immunizationSummaryService.save($scope.summaryRecord)
        .then(function() {
          $state.go('summary-sheet');
        })
        .catch(function(reason) {
          console.log(reason);
        });
    };

    $scope.selectSessionType = function() {

      if (angular.isUndefined($scope.summaryRecord.sessionType) || $scope.summaryRecord.sessionType === '') {
        $scope.viewControl.validationError.sessionType = 'Please a session to proceed';
      } else if (currentSummary.indexOf($scope.summaryRecord.sessionType) !== -1) {
        $scope.viewControl.validationError.sessionType = 'Summary with session type \''+$scope.summaryRecord.sessionType+'\' already exist';
      } else {
        $scope.viewControl.page = $scope.summarySetting.formConfig.togglePage ? 'preview' : 'groupSelection';
        delete $scope.viewControl.validationError['sessionType'];
      }
    };

    $scope.selectStage = function (name, stage) {
      var filtered = $scope.summarySetting.products
        .filter(function(row, index) {
          row.index = index;
          return row.productType === name.toLowerCase() && row.stage === stage;
        });
      var ageRangeSelect = !!((filtered.length && filtered.length > 1));
      var selectedProduct = (filtered.length && filtered.length > 1) ? filtered : filtered[0];
      delete $scope.viewControl.selectedRadio;
      showForm(selectedProduct, ageRangeSelect);
    };

    $scope.currentPage = function(page) {
      return $scope.viewControl.page === page;
    };

    $scope.showButton = function(button) {
      var condition = false, setting = $scope.summarySetting;
      var buttons = {
        preview: ['recordEntry'],
        save: ['summary'],
        editSession: ['preview', 'groupSelection'],
        prevNext: ['recordEntry'],
        confirm: ['preview'],
        proceed: ['recordEntry']

      };

      if (buttons[button]) {
        condition = buttons[button].indexOf($scope.viewControl.page) !== -1;
      }

      if (button === 'prevNext' && condition) {
        condition = setting.formConfig.wizard;
      }

      if (button === 'proceed' &&  condition) {
        condition = !setting.formConfig.wizard && !setting.formConfig.togglePage;
      }
      return condition;
    };

    $scope.navBack = function() {

      var page = $scope.viewControl.page;
      var parent = 'sessionSelection';
      var selected = $scope.viewControl.pages[page];
      var setting = $scope.summarySetting;

      if (page === parent) {
        $state.go('summary-sheet');
      }

      if (selected) {
        parent = selected.parent || parent;
        parent = setting.formConfig.togglePage && page === 'recordEntry' ? 'preview' : parent;
        $scope.viewControl.page = parent;
      }
    };

    $scope.confirmEntry = function() {
      $scope.viewControl.page = 'summary';
    };

    $scope.backToGroup = function() {
      $scope.viewControl.page = 'groupSelection';
    };

    $scope.showForm = showForm;


    function updateUI() {
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

    function updateSessionTypeList(sessionType, currentSummary) {
      var position = currentSummary.indexOf(sessionType);
      if (currentSummary.length > 0 && position !== -1) {
        currentSummary.splice(position, 1);
      }
      return currentSummary;
    }

    function showForm(selectedProduct, ageRangeSelection) {
      var page = ageRangeSelection ? 'recordEntry' : 'recordEntry';

      $scope.viewControl.step = ageRangeSelection ? selectedProduct[0].index : selectedProduct.index;
      $scope.viewControl.page = page;
      $scope.viewControl.selectedProduct = selectedProduct;
      testProductStages();
    }

    function testProductStages() {
      var step = $scope.viewControl.step;
      var selected = $scope.viewControl.selectedProduct;
      var filtered = [];

      if (step) {
        selected = $scope.summarySetting.products[step];
      }

      if (angular.isObject(selected)) {
        filtered = $scope.summarySetting.products
          .filter(function(row, index) {
            row.index = index;
            return row.productType === selected.productType.toLowerCase() && row.stage === selected.stage;
          });
      }

      if (filtered.length > 1) {
        $scope.viewControl.selectedProduct = filtered;
      }

      return filtered;
    }

    function summary() {
      var setting = $scope.summarySetting;
      var record = $scope.summaryRecord;

    }

    function getRecordSummary(recordList, productList) {
      var nullEntries = {};
      recordList = recordList || {};
      productList = productList || [];

      var filtered = productList.filter(function(row) {
        return angular.isUndefined(recordList[row.uuid]) || recordList[row.uuid] === 0;
      });

      if (filtered.length > 0) {
        nullEntries = {
          total: filtered.length,
          products: filtered
        }
      }

      return nullEntries;
    }

  });
