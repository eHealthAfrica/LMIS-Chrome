'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('takeSurvey', {
    url: '/take-survey?surveyUUID',
    parent: 'root.index',
    templateUrl: '/views/survey/take-survey.html',
    data: {
      label: 'Survey'
    },
    resolve: {
      appConfig: function(appConfigService){
          return appConfigService.load();
      }
    },
    controller: function ($stateParams, $state, $scope, surveyFactory, alertsFactory, appConfig, i18n) {

      if(!$stateParams.surveyUUID){
        alertsFactory.danger(i18n('surveyNotFound'), {persistent: true});
        return;
      }

      //load survey
      $scope.survey = surveyFactory.surveys[$stateParams.surveyUUID];
      $scope.surveyResponse = [];
      $scope.responses = {};

      if(typeof $scope.survey === 'undefined'){
        alertsFactory.danger(i18n('surveyNotFound'), {persistent: true});
        return;
      }

      $scope.newValue = function(questionId, newValue){
        $scope.responses[questionId] = newValue;
      };

      $scope.save = function () {

        $scope.isSaving = true;

        var surveyResponse = {
          survey: $scope.survey.uuid,
          facility: appConfig.appFacility.uuid,
          respondent: appConfig.contactPerson,
          responses: $scope.responses
        };

        //set survey completed flag
        surveyResponse.isComplete = $scope.survey.questions.length === Object.keys($scope.responses).length;

        if (!surveyResponse.isComplete) {
          console.log('incomplete survey');
          $scope.isSaving = false;
          alertsFactory.danger(i18n('incompleteSurveyErrorMsg'));
          return;
        }

        surveyFactory.saveSurveyResponse(surveyResponse)
          .then(function (result) {
            if (result) {
              var successMsg = i18n('surveySuccessMsg', $scope.survey.name);
              $state.go('home.index.home.mainActivity', {surveySuccessMsg: successMsg});
              $scope.isSaving = false;
            } else {
              alertsFactory.danger(i18n('surveyFailedMsg'));
              $scope.isSaving = false;
            }
          }, function (reason) {
            alertsFactory.danger(i18n('surveyFailedMsg'));
            $scope.isSaving = false;
        });
      };

    }
  })
});