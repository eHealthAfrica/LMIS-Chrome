'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('loadingFixture', {
        parent: 'root.index',
        templateUrl: 'views/index/loading-fixture-screen.html',
        url: '/loading-fixture',
      })
      .state('migrationScreen', {
        parent: 'root.index',
        templateUrl: 'views/index/migration-screen.html',
        url: '/migration-screen'
      });
  });
