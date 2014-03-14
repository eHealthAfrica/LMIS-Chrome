'use strict';

describe('Service: inventoryRulesFactory', function() {

  // load the service's module
  beforeEach(module(
    'lmisChromeApp',
    'lmisChromeAppMocks',
    'ordersMocks',
    'facilitiesMocks',
    'settingsMocks',
    'inventoriesMocks'
  ));

  // instantiate service
  var inventoryRulesFactory, orders, facilities, settings, inventory;
  beforeEach(inject(function(_inventoryRulesFactory_, ordersMock, facilitiesMock, settingsMock, inventoriesMock) {
    inventoryRulesFactory = _inventoryRulesFactory_;
    orders = ordersMock;
    facilities = facilitiesMock;
    settings = settingsMock;
    inventory = inventoriesMock;
  }));

  describe('lead time', function() {
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

      expect(function() {
        inventoryRulesFactory.leadTime(order);
      }).toThrow('Invalid Date');
    });

    it('should fail if the order has not been received', function() {
      // jshint camelcase: false
      var orders = [
        {created: '2014-03-04T12:30:30'},
        {created: '2014-03-04T12:30:30', date_receipt: ''}
      ];
      orders.forEach(function(order) {
        expect(function() {
          inventoryRulesFactory.leadTime(order);
        }).toThrow('Invalid Date');
      });
    });

    it('should throw if created before received', function() {
      var order = {
        created: '2014-03-04T12:30:30Z',
        // jshint camelcase: false
        date_receipt: '2014-03-04',
      };
      expect(function() {
        inventoryRulesFactory.leadTime(order);
      }).toThrow('Order was created before it was received');
    });
  });

  describe('consumption', function() {
    it('should calculate a facility consumption level', function() {
      var consumption = inventoryRulesFactory.consumption(facilities[0]);
      expect(typeof consumption).toBe('number');
    });
  });

  describe('lead-time consumption', function() {
    it('should calculate the lead-time consumption', function() {
      var leadTime = 0, leadTimes = [], consumptions = [10, 40];

      orders.forEach(function(order) {
        leadTime = inventoryRulesFactory.leadTime(order);
        leadTimes.push(leadTime);
      });

      var ltc = inventoryRulesFactory.leadTimeConsumption(leadTimes, consumptions);

      expect(typeof ltc).toBe('number');
      expect(ltc).toBe(42660000000);
    });
  });

  describe('service factor', function() {
    it('should return a number between zero and 100', function() {
      var serviceLevel = settings.inventory.serviceLevel;
      var serviceFactor = inventoryRulesFactory.serviceFactor(serviceLevel);
      expect(serviceFactor).toBe(1.28);
    });
  });

  describe('buffer stock', function() {
    it('should return a list of buffer levels for each product', function() {
      var levels = inventoryRulesFactory.bufferStock(inventory);
      expect(angular.isArray(levels)).toBe(true);
    });
  });
});
