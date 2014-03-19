'use strict';

describe('Service: dashboardfactory', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

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

  // instantiate service
  var $q, $rootScope, dashboardfactory;
  beforeEach(inject(function(_$q_, _$rootScope_, _dashboardfactory_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    dashboardfactory = _dashboardfactory_;
  }));

  it('should plot the required keys', function() {
    var required = ['below', 'buffer', 'safety', 'max'], keysMock = {};
    required.forEach(function(key) {
      keysMock[key] = {};
    });

    var deferred = $q.defer();
    deferred.resolve(keysMock);
    spyOn(dashboardfactory, 'keys').andReturn(deferred.promise);

    $rootScope.$apply(function() {
      dashboardfactory.keys().then(function(result) {
        expect(result).toBe(keysMock);
      });
    });
  });
});
