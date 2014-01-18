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
            .when('/home', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/settings', {
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl'
            })
            .when('/orders/:template', { templateUrl: function(elem){

                    return 'views/orders/'+elem.template+'.html';
                },
                controller: 'OrdersctrlCtrl'

            })
            .when('/stockrecords/:template', { templateUrl: function(elem){

                    return 'views/stockrecords/'+elem.template+'.html';
                },
                controller: 'StockrecordsCtrl'

            })
            .otherwise({
                redirectTo: '/'
            });
    });

angular.module('lmisChromeApp')
    .config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);

/* Central Variable for Watching Online/Offline Events */
angular.module('lmisChromeApp')
    .run(function($window, $rootScope) {

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