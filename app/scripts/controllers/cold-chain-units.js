'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('reportCcuBreakdown', {
      url: '/report-ccu',
      parent: 'root.index',
      templateUrl: '/views/cold-chain-units/report-ccu-breakdown.html',
      data: {
        label: 'Report CCU Breakdown'
      },
      resolve: {
        appConfig: function(appConfigService) {
          return appConfigService.getCurrentAppConfig();
        },
        breakdowns : function(ccuBreakdownFactory){
          return ccuBreakdownFactory.getAll();
        }
      },
      controller: 'ReportCcuBreakdownCtrl'
    });
  })
  .controller('ReportCcuBreakdownCtrl', function($scope, appConfig, $modal, i18n, $log, notificationService, ccuBreakdownFactory, $state, growl, alertFactory, breakdowns) {

    $scope.facilityCcuList = appConfig.selectedCcuProfiles;
    $scope.breakdowns = [];
    $scope.faults = [
      'Leaking',
      'Broken Seal',
      "No Power Supply",
      "Others"
    ];
    $scope.faultSortDate = 'asc';
    $scope.toggleFaultSortDate = function(){

      if($scope.faultSortDate ==='desc') {

        $scope.previewCcuProfile.ccuStatus.sort(function (a, b) {
          return (a.created > b.created);
        });
        $scope.faultSortDate = 'asc';
      }else{
        $scope.previewCcuProfile.ccuStatus.sort(function (a, b) {
          return (b.created > a.created);
        });
        $scope.faultSortDate = 'desc';
      }
    }
    $scope.breakdowns = breakdowns;
    var c;
    $scope.ccuBreakdown = {
      ccuProfile: '',
      facility: appConfig.facility,
      isSubmitted: false
    };
    $scope.selectedProfile = "";
    $scope.activeCCE ={
      ccuProfile: '',
      ccuStatus:[],
      facility: appConfig.facility,
      created: new Date().getTime()
    };
    $scope.formVal = {
          fault:'',
          status: 0,
          created: new Date().getTime()
         }

    $scope.switchActiveCCE = function(){
      $scope.breakdowns.forEach(function(ccuBreakdown){
        if(ccuBreakdown.ccuProfile.uuid === $scope.activeCCE.ccuProfile.uuid) {
          $scope.activeCCE  = ccuBreakdown;
        }
      });
      $scope.activeCCE.ccuStatus.push($scope.formVal);
    }

    $scope.save = function() {
      $scope.isSaving = true;
       $scope.activeCCE.ccuProfile = JSON.parse($scope.selectedProfile);
      $scope.switchActiveCCE();


      var ccuBreakdownReport = {
        ccuProfile: $scope.activeCCE.ccuProfile,
        facility: $scope.activeCCE.facility
      };

      var ccuProfileInfo = ccuBreakdownReport.ccuProfile.Manufacturer + ' ' + ccuBreakdownReport.ccuProfile.ModelName;
      var confirmationTitle = i18n('confirmCcuBreakdownReportHeader', ccuProfileInfo);
      var confirmationQuestion = i18n('dialogConfirmationQuestion');
      var buttonLabels = [i18n('yes'), i18n('no')];

      notificationService.getConfirmDialog(confirmationTitle, confirmationQuestion, buttonLabels)
        .then(function(isConfirmed) {
          if (isConfirmed === true) {

            ccuBreakdownFactory.save($scope.activeCCE) //ccuBreakdownReport
              .then(function(result) {
                //move to home page send alert in the background
                alertFactory.success(i18n('ccuBreakdownReportSuccessMsg'));
                ccuBreakdownFactory.broadcast(result)
                  .finally(function() {
                    $state.go('home.index.home.mainActivity');
                  });
              })
              .catch(function(reason) {
                growl.error(i18n('ccuBreakdownReportFailedMsg'));
                $scope.isSaving = false;
                $log.info(reason);
              });
          }
        })
        .catch(function(reason) {
          $scope.isSaving = false;
          $log.info(reason);
        });
    };
    $scope.inView = 1;
    $scope.previewCcuProfile = {};
    $scope.toggleInView = function(viewId){
      $scope.inView = viewId;
    };
    $scope.showCcuHistory = function(ccu){
        $scope.previewCcuProfile = ccu;
    }
    $scope.toggleCCEStatus = function(breakdown){
      breakdown.status = 1;
      ccuBreakdownFactory.save($scope.previewCcuProfile)
        .then(function(savedData){
          ccuBreakdownFactory.broadcast(savedData)
            .finally(function(){
              alertFactory.success(i18n('ccuBreakdownReportSuccessMsg'));
            })
        })
    }
  });