'use strict';

angular.module('lmisChromeApp')
  .factory('surveyFactory', function ($q) {
    var QUESTION_TYPES = {YES_NO: 0};
    var INTERVALS = {ONCE: 0, DAILY: 1, BIWEEKLY: 14, WEEKLY: 30};

    var getFacilitySetupSurvey = function(){
      var deferred = $q.defer();
      var questions = [
        {
          text: 'Is there immunization schedule session plan for RI?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          text: 'Does the health facility have vaccination monitoring chart?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          text: 'Does the facility have defaulter tracking mechanism?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          text: 'Does the facility have immunization in practice module or any RI training materials available?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        },
        {
          text: 'Was the RI service provider trained?',
          type: QUESTION_TYPES.YES_NO,
          interval: INTERVALS.ONCE
        }
      ]
      deferred.resolve(questions);
      return deferred.promise;
    }

    // Public API here
    return {
      types: QUESTION_TYPES,
      intervals: INTERVALS,
      getSetupSurvey: getFacilitySetupSurvey
    };

  });
