'use strict';

angular.module('lmisChromeApp')
  .factory('surveyFactory', function ($q, storageService, syncService) {
    var QUESTION_TYPES = {YES_NO: 0};
    var INTERVALS = {ONCE: 0, DAILY: 1, WEEKLY: 7, BIWEEKLY: 14, MONTHLY: 30};
    var SURVEYS = {
      "0987-0987-82763-34562-123": {
        uuid: "0987-0987-82763-34562-123",
        name: "Facility setup survey",
        interval: INTERVALS.ONCE,
        questions: [
            {
              uuid: "123456-0987809-897625-0987856",
              text: 'Is there immunization schedule session plan for RI?',
              type: QUESTION_TYPES.YES_NO
            },
            {
              uuid: "123456-0987856-897625-0987809",
              text: 'Does the health facility have vaccination monitoring chart?',
              type: QUESTION_TYPES.YES_NO
            },
            {
              uuid: "0987223-2341-4362716271-098632",
              text: 'Does the facility have defaulter tracking mechanism?',
              type: QUESTION_TYPES.YES_NO
            },
            {
              uuid: "2341-0987223-98277288-927672",
              text: 'Does the facility have immunization in practice module or any RI training materials available?',
              type: QUESTION_TYPES.YES_NO
            },
            {
              uuid: "99388281-9920292-12388292-0901",
              text: 'Was the RI service provider trained?',
              type: QUESTION_TYPES.YES_NO
            }
          ],
          facilities: [
            "fa3fdb8e-24bb-4ba6-b598-050c6285d08e",
            "a6ef2104-45bb-438c-80b8-21b4cb7d43bc",
            "902aef31-051d-4a83-9017-6ac9710b5bb5",
            "d48a39fb-6d37-4472-9983-bc0720403719"
          ]
        },
        "123456-0987809-897625-0987856": {
        uuid: "123456-0987809-897625-0987856",
        name: "Catchment area meeting survey",
        interval: INTERVALS.MONTHLY,
        questions: [
            {
              uuid: "0987856-897625-095623-abr67",
              text: 'Was catchment area meeting conducted in the last month for this health facility?',
              type: QUESTION_TYPES.YES_NO
            }
          ],
          facilities: [
            "fa3fdb8e-24bb-4ba6-b598-050c6285d08e",
            "a6ef2104-45bb-438c-80b8-21b4cb7d43bc",
            "902aef31-051d-4a83-9017-6ac9710b5bb5",
            "d48a39fb-6d37-4472-9983-bc0720403719"
          ]
        }
      };

    var getSurveyByUUID = function(uuid){
      var deferred = $q.defer();
      deferred.resolve(SURVEYS[uuid]);
      return deferred.promise;
    };

    var getPendingSurveys = function(facilityUUID){
      //TODO: make reminder to work by interval
      var deferred = $q.defer();
      storageService.all(storageService.SURVEY_RESPONSE)
        .then(function(surveyResponses){
          console.log(surveyResponses);
          var pendingSurveys = [];
          var today = new Date();
          for(var key in SURVEYS){
            var survey = SURVEYS[key];
            if(survey.facilities.indexOf(facilityUUID) > -1){
              var completedSurvey = surveyResponses.filter(function(surveyResponse){
                var isComplete = surveyResponse.isComplete && survey.uuid === surveyResponse.survey;
                return isComplete;
              });
              if(completedSurvey.length === 0){
                pendingSurveys.push(survey);
              }
            }
          }
          deferred.resolve(pendingSurveys);
        }, function(reason){
          deferred.reject(reason)
          console.log('Error trying to get surveys '+reason);
      });
      return deferred.promise;
    };

    var getFacilitySetupSurvey = function(){
      var deferred = $q.defer();
      deferred.resolve(SURVEYS['0987-0987-82763-34562-123']);
      return deferred.promise;
    };

    var saveSurveyResponse = function(surveyResponse){
      var deferred = $q.defer();
      if(surveyResponse.isComplete === true){
        storageService.save(storageService.SURVEY_RESPONSE, surveyResponse)
            .then(function (result) {
              deferred.resolve(result);
              if (typeof result !== 'undefined') {
                surveyResponse.uuid = result;
                syncService.syncItem(storageService.SURVEY_RESPONSE, surveyResponse)
                    .then(function (result) {
                      console.log('survey response synced successfully!');
                    }, function (reason) {
                      console.error('survey syncing failed: ' + reason);
                    })
              }
            }, function (reason) {
              deferred.reject(reason);
            });
      }else{
        deferred.reject('incomplete survey not saved');
      }
      return deferred.promise;
    };

    // Public API here
    return {
      types: QUESTION_TYPES,
      intervals: INTERVALS,
      surveys: SURVEYS,
      getSetupSurvey: getFacilitySetupSurvey,
      saveSurveyResponse: saveSurveyResponse,
      getPendingSurveys: getPendingSurveys,
      get: getSurveyByUUID
    };

  });
