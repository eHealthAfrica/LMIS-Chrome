'use strict';

describe('Service stockCountFactory', function(){
  beforeEach(module('lmisChromeApp', 'stockCountMocks', 'i18nMocks'));

  var stockCountFactory,
      stockCount,
      scope,
      _i18n,
      storageService,
      $q;
   // Initialize the state
  beforeEach(inject(function($templateCache) {
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

    angular.forEach(templates, function(template) {
      $templateCache.put('views/' + template + '.html', '');
    });
  }));

  beforeEach(inject(function(_stockCountFactory_, $rootScope, stockData, _$q_, i18n, _storageService_){
    stockCountFactory = _stockCountFactory_;
    scope = $rootScope.$new();
    stockCount = stockData;
    _i18n = i18n;
    storageService = _storageService_;
    $q = _$q_;

    spyOn(stockCountFactory, 'getStockCountByDate').andCallFake(function (date) {
      //TODO: re-write this when local storage and storageprovider mocks are completed.
      if (date > new Date()) {
        return $q.when({uuid: '1234567890-08829199-89872-9087-1234567892'});
      } else {
        return $q.when(null);
      }
    });
    spyOn(stockCountFactory.validate.stock, 'countExist').andCallFake(function (date) {
      if(date === '2014-03-25'){
        return $q.when({isComplete: true});
      }else{
        return $q.when(null);
      }

    });
  }));

  it('should expose a load method aliased as "get"', function(){
    expect(stockCountFactory).toBeDefined();
  });

  it('i expect stockCount.getAll() to call storageService.all with right parameters.', function(){
    spyOn(storageService, 'all').andCallThrough();
    expect(storageService.all).not.toHaveBeenCalled();
    stockCountFactory.getAll();
    expect(storageService.all).toHaveBeenCalledWith(storageService.STOCK_COUNT);
  });

  it('should confirm validate object exist', function(){
    expect(stockCountFactory.validate).toBeDefined();
  });

  it('it should return true if variable is empty (""), undefined, not a number or is negative', function(){
    expect(stockCountFactory.validate.invalid(-20)).toBeTruthy();
  });

  it('as user i want to be access stock count for a given date', function(){
    var stockCount = {};
    stockCountFactory.getStockCountByDate((new Date()).getDate() + 1).then(function(result){
      stockCount = result;
    });
    expect(stockCount).not.toBeNull();
    scope.$digest();
    expect(stockCountFactory.getStockCountByDate).toHaveBeenCalled();
    expect(stockCount).toBeNull();
  });

  it('should not return if date exist', function(){
    var stockCount = null;
    stockCountFactory.validate.stock.countExist('2014-03-25').then(function(data){
      stockCount = data;
    });
    expect(stockCount).toBeNull();
    scope.$digest();
    expect(stockCountFactory.validate.stock.countExist).toHaveBeenCalled();
    expect(stockCount).not.toBeNull();
  });

  it('i expect stockCountFactory.getMostRecentStockCount() most recent stock count from a list of stock counts..', function(){
    var today = new Date();
    var oneDay = 86400000; //in milli-seconds
    var yesterday = new Date(today.getTime() - oneDay);
    var tomorrow = new Date(today.getTime() + oneDay);

    spyOn(storageService, 'all').andCallFake(function () {
      var stockCounts = [
        { uuid: '4321', created: yesterday },
        { uuid: '1234', created: today },
        { uuid: '3652', created: tomorrow }
      ];
      var deferred = $q.defer();
      deferred.resolve(stockCounts);
      return deferred.promise;
    });
    expect(storageService.all).not.toHaveBeenCalled();
    runs(
        function () {
          return stockCountFactory.getMostRecentStockCount();
        },
        function checkExpectations(mostRecentStockCount) {
          expect(mostRecentStockCount.created).toBe(tomorrow);
        }
    );
  });

});
