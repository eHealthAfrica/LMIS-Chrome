'use strict';

describe('Inventory controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  // Initialize the state
  beforeEach(inject(function($templateCache, $httpBackend) {
    // Mock each template used by the state
    var homeTemplates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(homeTemplates, function(template) {
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


  it('as a user, i want to add new inventory url to be /add-inventory', function() {
    var addNewInventory = $state.get('addNewInventory');
    expect($state.href(addNewInventory)).toEqual('#/add-inventory');
    expect($state.href(addNewInventory)).not.toEqual('#/add-inventories');
  });

});
