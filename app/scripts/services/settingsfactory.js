'use strict';

angular.module('lmisChromeApp')
  .factory('settingsService', function($q, storageService) {

    function getSettingsFromStorage() {
      var defered = $q.defer();
      storageService.get('settings').then(function(settings) {
        defered.resolve(settings);
      });
      return defered.promise;
    }

    function saveSettings(settings) {
      storageService.add('settings', settings).then();
      // TODO: convert to promise and send message on successful save, probably make generic in storageprovider
    }

    return {
      load: getSettingsFromStorage,
      save: saveSettings
    };

  });
