'use strict';

angular.module('lmisChromeApp')
    .controller('SettingsCtrl', ['$scope', 'storageProvider'], function ($scope, storageProvider) {

        // var facility = $scope.facility = {};
        // var chromestorage = $scope.chromestorage = {}

        /* TODO: come up with chrome.storage.local provider ie: http://gregpike.net/demos/angular-local-storage/demo/demo.html */
//        chrome.storage.local.get('facility', function(value){
//            $scope.$apply(function() {
//                $scope.load(value);
//            });
//        });
        $scope.$watch('facility', function(value) {
            $scope.facility = storageProvider.get('facility', 'facility');
        });


//        chrome.storage.local.get(null, function(storage) {
//            $scope.$apply(function() {
//                if (storage) {
//                    $scope.chromestorage = storage;
//                } else {
//                    $scope.chromestorage = {};
//                }
//            });
//        });
//
//        $scope.load = function(value) {
//            if (value && value.facility) {
//                $scope.facility = value.facility;
//            } else {
//                $scope.facility = {};
//                /* TODO: get defaults from Facility Factory */
//            }
//        };

        $scope.save = function() {
            $scope.$watch('facility', function(value) {
               storageProvider.set('facility', $scope.facility, 'facility');
            });
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

