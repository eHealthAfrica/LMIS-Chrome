'use strict';

angular.module('lmisChromeApp')
    .controller('SettingsCtrl', function ($scope) {

        // var facility = $scope.facility = {};

        /* TODO: come up with chrome.storage.local provider ie: http://gregpike.net/demos/angular-local-storage/demo/demo.html */
        chrome.storage.local.get('facility', function(value){
            $scope.$apply(function() {
                $scope.load(value);
            });
        });

        $scope.load = function(value) {
            if (value && value.facility) {
                $scope.facility = value.facility;
            } else {
                $scope.facility = {};
                /* TODO: get defaults from Facility Factory */
            }
        };

        $scope.save = function() {
             chrome.storage.local.set({'facility': $scope.facility});
        };

        /* LMIS App Settings
        * Facility Name: [can be a drop down generated from a json file in filesystemstorage or retrieved from web service
        *                 based on site UUID and SecretKey]
        * Facility Type: [drop down or web service]
        * GlobalID: [uuid for chrome app installation, generated 1st run only. used to retreive data from server]
        * SecretKey: [random generated key for use in matching GlobalID, generated at server or app?]
        * Facility Users/Staff: [name, position/title, contact details for facility staff]
        *
        *
        *
        *
        * Inspect Chrome Storage:
        *                   chrome.storage.local.get(null, console.log.bind(console));  */

    });

