'use strict';

describe('Home controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  // Initialize the state
  beforeEach(inject(function($templateCache) {
    // Mock each template used by the state
    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/home/' + template + '.html', '');
    });
  }));

  it('should go to the control panel state', function() {
    var cp = 'home.index.controlPanel';
    inject(function($rootScope, $state, $httpBackend) {
      $httpBackend.whenGET('/locales/en.json').respond(200, {});
      $httpBackend.whenGET('/locales/en_GB.json').respond(200, {});
      $rootScope.$apply(function() {
        $state.go(cp);
      });
      expect($state.current.name).toBe(cp);
    });
  });

});
