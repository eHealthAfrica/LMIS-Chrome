'use strict';


angular.module('lmisChromeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

/* Central Variable for Watching Online/Offline Events */
angular.module('lmisChromeApp')
    .run(function($window, $rootScope) {
        $rootScope.online = navigator.onLine;
        console.log("online" + $rootScope.online);
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