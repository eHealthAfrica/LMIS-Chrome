'use strict';

describe('Inventory controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var $state;
  beforeEach(inject(function(_$state_) {
    $state = _$state_;
  }));

  it('as a user, i want to add new inventory url to be /add-inventory', function() {
    var addNewInventory = $state.get('addNewInventory');
    expect($state.href(addNewInventory)).toBe('#/add-inventory');
  });
});
