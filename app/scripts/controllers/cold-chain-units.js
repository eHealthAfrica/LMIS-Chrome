angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('reportCcuBreakdown', {
    url: '/report-ccu',
    parent: 'root.index',
    templateUrl: '/views/cold-chain-units/report-ccu-breakdown.html',
    data: {
      label: 'Report CCU Breakdown'
    },
    resolve: {
      appConfig: function(appConfigService){
          return appConfigService.getCurrentAppConfig();
      }
    },
    controller: 'ReportCcuBreakdownCtrl'
  })
}).controller('ReportCcuBreakdownCtrl', function($scope, appConfig, $modal, i18n, $log, notificationService, ccuBreakdownFactory, $state, alertsFactory){
      $scope.facilityCcuList = appConfig.selectedCcuProfiles;

      $scope.ccuBreakdown = {
        ccuProfile: '',
        facility: appConfig.appFacility,
        isSubmitted: false
      };

      $scope.save = function(){
        $scope.isSaving = true;

        var ccuBreakdownReport = {
          ccuProfile: JSON.parse($scope.ccuBreakdown.ccuProfile),
          facility: $scope.ccuBreakdown.facility
        };

        var ccuProfileInfo = ccuBreakdownReport.ccuProfile.Manufacturer+' '+ccuBreakdownReport.ccuProfile.ModelName;
        var confirmationTitle = i18n('confirmCcuBreakdownReportHeader', ccuProfileInfo);
        var confirmationQuestion = i18n('dialogConfirmationQuestion');
        var buttonLabels = [i18n('yes'), i18n('no')];

        notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
            .then(function (isConfirmed) {
              if (isConfirmed === true) {
                ccuBreakdownFactory.saveAndSendReport(ccuBreakdownReport)
                    .then(function (result) {
                      $state.go('home.index.home.mainActivity', {ccuBreakdownReportResult: true });
                    }).catch(function (reason) {
                      alertsFactory.danger(i18n('ccuBreakdownReportFailedMsg'));
                      $log.info(reason);
                    }).finally(function () {
                      $scope.isSaving = false;
                    });
              }
            })
            .catch(function (reason) {
              alertsFactory.danger(i18n('ccuBreakdownReportFailedMsg'));
              $scope.isSaving = false;
              $log.info(reason);
            });
      };
    });
