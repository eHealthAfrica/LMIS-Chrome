'use strict';

angular.module('lmisChromeApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'restangular'
])
  .config(function ($routeProvider, $compileProvider, RestangularProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/home', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/orders', {
        templateUrl: 'views/orders.html',
        controller: 'OrdersCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

    RestangularProvider.setBaseUrl('http://lmis.ehealth.org.ng/api/v1');
    // RestangularProvider.setDefaultRequestParams({ apiKey: '1111111111111111111111111' });
  });

//angular.module('lmisChromeApp')
//    .config(['$compileProvider', function($compileProvider) {
//        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
//    }]);

/* Config Block for Restangular Provider */
//  .config(function(RestangularProvider) {
//
//});

/* Central Variable for Watching Online/Offline Events */
angular.module('lmisChromeApp')
    .run(function($window, $rootScope, SyncService) {

        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
            $rootScope.$apply(function() {
                $rootScope.online = false;
            });
        }, false);
        $window.addEventListener("online", function () {
            $rootScope.$apply(function() {
                $rootScope.online = true;
            });
        }, false);
    });