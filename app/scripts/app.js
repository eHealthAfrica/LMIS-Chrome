'use strict';

angular.module('lmisChromeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'restangular',
  'ngRoute',
  'ui.bootstrap',
  'ngTable',
  'ui.router'
])
  .config(function(RestangularProvider, $compileProvider) {
    RestangularProvider.setBaseUrl('http://lmis.ehealth.org.ng/api/v1');
    $compileProvider.aHrefSanitizationWhitelist(
      /^\s*(https?|ftp|mailto|chrome-extension):/
    );
  })

  // Central Variable for Watching Online/Offline Events
  .run(function($window, $rootScope, $state, $stateParams, storageService) {
    //global message placeholder
    $rootScope.messages = [];

    $rootScope.setMessage = function(message) {
      if (Object.prototype.toString.call(message) === '[object Object]') {
        $rootScope.messages.push(message);
      }
    };

    $rootScope.closeAlert = function(index) {
      $rootScope.messages.splice(index, 1);
    };

    // https://developer.chrome.com/extensions/i18n.html
    $rootScope.i18n = $window.chrome.i18n.getMessage;

    //chrome.storage.local.clear();
    storageService.loadFixtures();

    $rootScope.online = navigator.onLine;

    $window.addEventListener('offline', function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      });
    }, false);

    $window.addEventListener('online', function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      });
    }, false);

    // Default state
    $state.go('home.index.controlPanel');
  });
