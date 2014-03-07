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

  it('should calculate the lead time for an order in ms', function() {
    var leadTime = inventoryRulesFactory.leadTime(orders[0]);
    expect(typeof leadTime).toBe('number');
    expect(leadTime).toBe(345600000);
  });

  it('should calculate a facility consumption level', function() {
    var consumption = inventoryRulesFactory.consumption(orders[0]);
    expect(typeof consumption).toBe('number');
  });

  it('should calculate the lead-time consumption', function() {
    var order = orders[0],
        leadTime = inventoryRulesFactory.leadTime(order),
        consumption = inventoryRulesFactory.consumption(order);

    var ltc = inventoryRulesFactory.leadTimeConsumption(leadTime, consumption);
    expect(typeof ltc).toBe('number');
  });

});
