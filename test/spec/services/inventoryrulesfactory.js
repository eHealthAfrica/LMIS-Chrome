'use strict';

describe('Service: inventoryRulesFactory', function() {

  // load the service's module
  beforeEach(module(
    'lmisChromeApp',
    'lmisChromeAppMocks',
    'ordersMocks',
    'facilitiesMocks'
  ));

  // instantiate service
  var inventoryRulesFactory, orders, facilities;
  beforeEach(inject(function(_inventoryRulesFactory_, ordersMock, facilitiesMock) {
    inventoryRulesFactory = _inventoryRulesFactory_;
    orders = ordersMock;
    facilities = facilitiesMock;
  }));

  it('should calculate the lead time for an order in ms', function() {
    var leadTime = inventoryRulesFactory.leadTime(orders[0]);
    expect(typeof leadTime).toBe('number');
    expect(leadTime).toBe(302400000);
  });

  it('should fail with non-compliant datestrings', function() {
    // Expects RFC2822 or ISO 8601 dates
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    var order = {
      // Whitespace separator is invalid here; should be 'T'
      created: '2014-03-04 12:30:30',
      // Just the date component is valid ISO 8601
      // jshint camelcase: false
      date_receipt: '2014-03-08',
    };

    var leadTime = inventoryRulesFactory.leadTime(order);
    expect(leadTime).toBeNaN();
  });

  it('should calculate a facility consumption level', function() {
    var consumption = inventoryRulesFactory.consumption(facilities[0]);
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
