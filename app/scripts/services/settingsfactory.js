'use strict';

angular.module('lmisChromeApp')
  .factory('settingsService', function ($q, storageService) {

    var getSettingsFromStorage = function() {
      var deferred = $q.defer();
      storageService.get('settings')
        .then(function(settings) {
          deferred.resolve(settings);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var saveSettings = function(settings) {
      var deferred = $q.defer();
      storageService.add('settings', settings)
        .then(function(result) {
          deferred.resolve(result);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    return {
      load: getSettingsFromStorage,
      save: saveSettings
    };
  });
