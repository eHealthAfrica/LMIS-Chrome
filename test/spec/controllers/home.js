'use strict';

describe('Home controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // Initialize the state
  beforeEach(inject(function ($templateCache) {
    // Mock each template used by the state
    var templates = [
      'index/index',
      'index/header',
      'index/breadcrumbs',
      'index/footer',
      'home/index',
      'home/nav',
      'home/sidebar',
      'home/control-panel',
      'home/main-activity',
      'home/home',
      'dashboard/dashboard',
      'index/loading-fixture-screen'
    ];

    angular.forEach(templates, function (template) {
      $templateCache.put('views/' + template + '.html', '');
    });
  }));

  var $rootScope, $state;
  beforeEach(inject(function (_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  var state = 'home.index.home.mainActivity';
  xit('should respond to URL', function () {
    expect($state.href(state)).toEqual('#/main-activity');
  });

  xit('should go to the main activity state', function () {
    var home = $state.get('home');
    home.resolve.appConfig = function () {
      return {};
    };
    $rootScope.$apply(function () {
      $state.go(state);
    });
    expect($state.current.name).toBe(state);
  });

});
