'use strict';

describe('Service: inventoryRulesFactory', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks', 'ordersMocks'));

  // instantiate service
  var inventoryRulesFactory, orders;
  beforeEach(inject(function(_inventoryRulesFactory_, ordersMock) {
    inventoryRulesFactory = _inventoryRulesFactory_;
    orders = ordersMock;
  }));

  it('should calculate the lead time for an order as a timestamp', function() {
    var leadTime = inventoryRulesFactory.leadTime(orders);
    expect(typeof leadTime).toBe('number');
  });

});
