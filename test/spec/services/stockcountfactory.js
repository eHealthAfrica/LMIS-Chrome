'use strict';

describe('Service stockCountFactory', function(){
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks', 'stockCountMocks'));

  var stockCountFactory;

  var scope;
  beforeEach(inject(function(_stockCountFactory_, $rootScope, $q, $templateCache, $httpBackend){
    stockCountFactory = _stockCountFactory_;
    scope = $rootScope;

    spyOn(stockCountFactory, "getStockCountByDate").andCallFake(function (date) {
      //TODO: re-write this when local storage and storageprovider mocks are completed.
      if (date < new Date()) {
        return $q.when({uuid: "1234567890-08829199-89872-9087-1234567892"});
      } else {
        return $q.when(null);
      }
    });

    // Mock each template used by the state
    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(templates, function (template) {
      $templateCache.put('views/home/' + template + '.html', '');
    });

    $httpBackend.whenGET('/locales/en.json').respond(200, {});
    $httpBackend.whenGET('/locales/en_GB.json').respond(200, {});
  }));

  it('should expose a load method aliased as "get"', function(){
    expect(stockCountFactory).toBeDefined();
  });

  it('should contain the name of a function', function(){
    expect(stockCountFactory.get.allStockCount).toBeDefined();
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

  it('as user i want to be access stock count for a given date', function(){
    var stockCount = {};
    stockCountFactory.getStockCountByDate(new Date()).then(function(result){
      stockCount = result;
    });
    expect(stockCount).not.toBeNull();
    scope.$digest();
    expect(stockCountFactory.getStockCountByDate).toHaveBeenCalled();
    expect(stockCount).toBeNull();

  });
});