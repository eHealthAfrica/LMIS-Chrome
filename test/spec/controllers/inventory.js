'use strict';

describe('Inventory controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

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

  var $state;
  beforeEach(inject(function(_$state_) {
    $state = _$state_;
  }));

  it('as a user, i want to add new inventory url to be /add-inventory', function() {
    var addNewInventory = $state.get('addNewInventory');
    expect($state.href(addNewInventory)).toBe('#/add-inventory');
  });
});
