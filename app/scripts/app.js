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
  .config(function($routeProvider) {
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
        templateUrl: function(elem) {
          return 'views/main/' + elem.template + '.html';
        },
        controller: 'MainCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/orders/:template', {
        templateUrl: function(elem) {
          return 'views/orders/' + elem.template + '.html';
        },
        controller: 'OrdersctrlCtrl'
      })
      .when('/facilities/:template', {
        templateUrl: function(elem) {
          return 'views/facilities/' + elem.template + '.html';
        },
        controller: 'FacilitiesCtrl'
      })
      .when('/inventory/:template', {
        templateUrl: function(elem) {
          return 'views/inventory/' + elem.template + '.html';
        },
        controller: 'InventoryCtrl'
      })
      .when('/cce/:template', {
        templateUrl: function(elem) {
          return 'views/cce/' + elem.template + '.html';
        },
        controller: 'cceCtrl'
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
  .run(function($window, $rootScope, utility) {
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

    //chrome.storage.local.clear();
    utility.loadFixtures();

    //TODO: change breadcrumbs to a service
    $rootScope.breadcrumbs = [];
    $rootScope.addbreadcrumbs = function(crumbs) {
      $rootScope.breadcrumbs = crumbs;
    };

    $rootScope.$on('$routeChangeSuccess', function() {
      $rootScope.breadcrumbs = [];
    });

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
