'use strict';

describe('Service stockCountFactory', function(){
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks', 'stockCountMocks'));

  var stockCountFactory;
  var stockCount;
  var scope;
  var q;
  beforeEach(inject(function(_stockCountFactory_, $rootScope, stockData){
    stockCountFactory = _stockCountFactory_;
    scope = $rootScope.$new();
    stockCount = stockData;
  }));

  it('should expose a load method aliased as "get"', function(){
    expect(stockCountFactory).toBeDefined();
  });

  it('should contain the name of a method', function(){
    expect(stockCountFactory.get.hasOwnProperty('allStockCount')).toBeTruthy();
  });

  it('should return Month object', function(){
    expect(stockCountFactory.monthList).toBeDefined();
  });

  it('should return 12 months', function(){
    var monthsCount = Object.keys(stockCountFactory.monthList).length;
    expect(monthsCount).toBeDefined(12);
  });

  it('should return the first month in the object', function(){
    expect(stockCountFactory.monthList['01']).toEqual('January');
  });
});