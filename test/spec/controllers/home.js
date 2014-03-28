'use strict';

describe('Home controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  // Initialize the state
  beforeEach(inject(function($templateCache, $httpBackend) {
    // Mock each template used by the state
    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/home/' + template + '.html', '');
    });

    $httpBackend.whenGET('/locales/en.json').respond(200, {});
    $httpBackend.whenGET('/locales/en_GB.json').respond(200, {});
  }));

  var $rootScope, $state;
  beforeEach(inject(function(_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  var state = 'home.index.mainActivity';
  it('should respond to URL', function() {
    expect($state.href(state)).toEqual('#/main-activity');
  });

  it('should go to the main activity state', function() {
    var home = $state.get('home');
    home.resolve.todayStockCount = function() { return {}; };
    home.resolve.appConfig = function(){ return {}; };
    $rootScope.$apply(function() {
      $state.go(state);
    });
    expect($state.current.name).toBe(state);
  });

});
