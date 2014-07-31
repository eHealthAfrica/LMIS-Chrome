'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider.state('root', {
      url: '',
      abstract: true,
      templateUrl: 'root/root.html'
    })
    .state('root.index', {
      abstract: true,
      views: {
        'header': {
          templateUrl: 'root/header.html',
          controller: 'HeaderCtrl'
        },
        'breadcrumbs': {
          templateUrl: 'root/breadcrumbs.html',
          controller: 'BreadcrumbsCtrl'
        },
        'content': {},
        'footer': {
          templateUrl: 'root/footer.html',
          controller: 'FooterCtrl'
        }
      }
    });
  });
