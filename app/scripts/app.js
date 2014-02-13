'use strict';

angular.module('lmisChromeApp', [
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngRoute',
      'restangular',
      'ui.bootstrap',
      'ngTable'
    ])
    .config(function ($routeProvider) {
      // TODO: change the router to ui-router:
      // https://github.com/angular-ui/ui-router/wiki/Quick-Reference
      $routeProvider
          .when('/', {
            templateUrl: 'views/main/dashboard.html',
            controller: 'MainCtrl'
          })
          .when('/home', {
            templateUrl: 'views/main/dashboard.html',
            controller: 'MainCtrl'
          })
          .when('/main/:template', {
            templateUrl: function (elem) {
              return 'views/main/' + elem.template + '.html';
            },
            controller: 'MainCtrl'
          })
          .when('/settings', {
            templateUrl: 'views/settings.html',
            controller: 'SettingsCtrl'
          })
          .when('/orders/:template', {
            templateUrl: function (elem) {
              return 'views/orders/' + elem.template + '.html';
            },
            controller: 'OrdersctrlCtrl'
          })
          .when('/facilities/:template', {
            templateUrl: function (elem) {
              return 'views/facilities/' + elem.template + '.html';
            },
            controller: 'FacilitiesCtrl'
          })
          .when('/inventory/:template', {
            templateUrl: function (elem) {
              return 'views/inventory/' + elem.template + '.html';
            },
            controller: 'InventoryCtrl'
          })
          .when('/cce/:template', {
            templateUrl: function (elem) {
              return 'views/cce/' + elem.template + '.html';
            },
            controller: 'cceCtrl'
          })
          .when('/products/:template', {
            templateUrl: function (elem) {
              return 'views/products/' + elem.template + '.html';
            },
            controller: 'ProductListCtrl'
          })
          .when('/batches/', {
            templateUrl: function (elem) {
              return 'views/batches/index.html';
            },
            controller: 'BatchListCtrl'
          })
          .otherwise({
            redirectTo: '/'
          });
    })

  // Config Block for Restangular Provider
  .config(function(RestangularProvider, $compileProvider) {
    RestangularProvider.setBaseUrl('http://lmis.ehealth.org.ng/api/v1');
    $compileProvider.aHrefSanitizationWhitelist(
      /^\s*(https?|ftp|mailto|chrome-extension):/
    );
  });

// Central Variable for Watching Online/Offline Events
angular.module('lmisChromeApp')
  .run(function($window, $rootScope, storageService) {
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
  });
