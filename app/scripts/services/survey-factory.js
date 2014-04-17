'use strict';

angular.module('lmisChromeApp')
  .factory('surveyFactory', function ($q, storageService, syncService) {
    var QUESTION_TYPES = {YES_NO: 0};
    var INTERVALS = {ONCE: 0, DAILY: 1, BIWEEKLY: 14, WEEKLY: 30};

    var getFacilitySetupSurvey = function(){
      var deferred = $q.defer();
      var questions = [
        {
          uuid: "123456-0987809-897625-0987856",
          text: 'Is there immunization schedule session plan for RI?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          uuid: "123456-0987856-897625-0987809",
          text: 'Does the health facility have vaccination monitoring chart?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          uuid: "0987223-2341-4362716271-098632",
          text: 'Does the facility have defaulter tracking mechanism?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          uuid: "2341-0987223-98277288-927672",
          text: 'Does the facility have immunization in practice module or any RI training materials available?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          uuid: "99388281-9920292-12388292-0901",
          text: 'Was the RI service provider trained?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        }
      ]
      deferred.resolve(questions);
      return deferred.promise;
    };

    var saveSurveyResponse = function(surveyResponse){
      var deferred = $q.defer();
      storageService.save(storageService.SURVEY_RESPONSE, surveyResponse)
        .then(function(result){
        deferred.resolve(result);
        if(typeof result !== 'undefined'){
          surveyResponse.uuid = result;
          syncService.syncItem(storageService.SURVEY_RESPONSE, surveyResponse)
            .then(function(result){
            console.log('survey response synced successfully!');
            }, function(reason){
            console.error('survey syncing failed: '+reason);
          })
        }
      }, function(reason){
        deferred.reject(reason);
      });
      return deferred.promise;
    };

    // Public API here
    return {
      types: QUESTION_TYPES,
      intervals: INTERVALS,
      getSetupSurvey: getFacilitySetupSurvey,
      saveSurveyResponse: saveSurveyResponse
    };

  });
