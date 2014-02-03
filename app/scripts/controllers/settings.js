'use strict';

angular.module('lmisChromeApp')
  .controller('SettingsCtrl', function($scope, settingsService) {

    settingsService.load().then(function(settings) {
      $scope.settings = settings;
    });

    console.log('settingsctrl');
    console.log($scope.settings);

    $scope.save = function() {
      settingsService.save($scope.settings);
    };

    /* LMIS App Settings
     * Facility Name: [can be a drop down generated from a json file in filesystemstorage or retrieved from web service
     *                 based on site UUID and SecretKey]
     * Facility Type: [drop down or web service]
     * GlobalID: [uuid for chrome app installation, generated 1st run only. used to retreive data from server]
     * Facility Users/Staff: [name, position/title, contact details for facility staff]
     *
     *
     *
     *
     * Inspect Chrome Storage:
     *                   chrome.storage.local.get(null, console.log.bind(console));  */

  });
