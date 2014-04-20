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
        $state.go('home.index.home.mainActivity');
        return;
      }

      //load survey
      $scope.survey = {};
      $scope.surveyResponse = [];

      surveyFactory.get($stateParams.surveyUUID)
        .then(function(result){
          if(result){
            $scope.survey = result;
          }else{
            alertsFactory.danger(i18n('surveyNotFound'), {persistent: true});
          }
        }, function(reason){
          console.error(reason);
          alertsFactory.danger(i18n('surveyNotFound'), {persistent: true});
      });

    $scope.save = function(){
      $scope.isSaving = true;
      //TODO: see if you can abstract creation of surveyResponse from survey form to so you can reuse it.
      var responses = [];
      for (var index in $scope.surveyResponse) {
        var response = {question: index, answer: $scope.surveyResponse[index]}
        responses.push(response);
      }
      var surveyResponse = {
        survey: $scope.survey.uuid,
        facility: appConfig.appFacility.uuid,
        respondent: appConfig.contactPerson,
        responses: responses,
        isComplete: $scope.survey.questions.length === responses.length
      }

      if(surveyResponse.isComplete === false){
        $scope.isSaving = false;
        alertsFactory.danger(i18n('incompleteSurveyErrorMsg'));
        return;
      }

      surveyFactory.saveSurveyResponse(surveyResponse)
        .then(function(result){
          if(result){
            $scope.isSaving = false;
            var successMsg = i18n('surveySuccessMsg', $scope.survey.name);
            $state.go('home.index.home.mainActivity', {surveySuccessMsg: successMsg});
          }else{
            $scope.isSaving = false;
            alertsFactory.danger(i18n('surveyFailedMsg'));
          }
      }, function(reason){
          $scope.isSaving = false;
          alertsFactory.danger(i18n('surveyFailedMsg'));
      });
    };

    }
  })
});