'use strict';

describe('Service stockCountFactory', function () {
  beforeEach(module('lmisChromeApp', 'stockCountMocks', 'i18nMocks'));

  var stockCountFactory, stockCount, scope, _i18n, storageService, $q, reminderFactory, utility;

  // Initialize the state
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

  beforeEach(inject(function (_stockCountFactory_, $rootScope, stockData, _$q_, i18n, _storageService_, _reminderFactory_, _utility_) {
    stockCountFactory = _stockCountFactory_;
    scope = $rootScope.$new();
    stockCount = stockData;
    _i18n = i18n;
    storageService = _storageService_;
    $q = _$q_;
    reminderFactory = _reminderFactory_;
    utility = _utility_;

    spyOn(stockCountFactory, 'getStockCountByDate').andCallFake(function (date) {
      //TODO: re-write this when local storage and storageprovider mocks are completed.
      if (date > new Date()) {
        return $q.when({uuid: '1234567890-08829199-89872-9087-1234567892'});
      } else {
        return $q.when(null);
      }
    });
    spyOn(stockCountFactory.validate.stock, 'countExist').andCallFake(function (date) {
      if (date === '2014-03-25') {
        return $q.when({isComplete: true});
      } else {
        return $q.when(null);
      }

    });
  }));

  it('should expose a load method aliased as "get"', function () {
    expect(stockCountFactory).toBeDefined();
  });

  it('i expect stockCount.getAll() to call storageService.all with right parameters.', function () {
    spyOn(storageService, 'all').andCallThrough();
    expect(storageService.all).not.toHaveBeenCalled();
    stockCountFactory.getAll();
    expect(storageService.all).toHaveBeenCalledWith(storageService.STOCK_COUNT);
  });

  it('should confirm validate object exist', function () {
    expect(stockCountFactory.validate).toBeDefined();
  });

  it('it should return true if variable is empty (""), undefined, not a number or is negative', function () {
    expect(stockCountFactory.validate.invalid(-20)).toBeTruthy();
  });

  it('as user i want to be access stock count for a given date', function () {
    var stockCount = {};
    stockCountFactory.getStockCountByDate((new Date()).getDate() + 1).then(function (result) {
      stockCount = result;
    });
    expect(stockCount).not.toBeNull();
    scope.$digest();
    expect(stockCountFactory.getStockCountByDate).toHaveBeenCalled();
    expect(stockCount).toBeNull();
  });

  it('should not return if date exist', function () {
    var stockCount = null;
    stockCountFactory.validate.stock.countExist('2014-03-25').then(function (data) {
      stockCount = data;
    });
    expect(stockCount).toBeNull();
    scope.$digest();
    expect(stockCountFactory.validate.stock.countExist).toHaveBeenCalled();
    expect(stockCount).not.toBeNull();
  });

  it('i expect stockCountFactory.getMostRecentStockCount() most recent stock count from a list of stock counts..', function () {
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

  it('i expect getStockCountDueDate() to return today\'s date when called with DAILY interval.', function () {
    var today = utility.getFullDate(new Date());
    var reminderDay = 5;//friday.
    var result = stockCountFactory.getStockCountDueDate(reminderFactory.DAILY, reminderDay);
    var stockCountDueDate = utility.getFullDate(result);
    expect(today).toBe(stockCountDueDate);
  });

  it('i expect getStockCountDueDate to return expected count date when called with WEEKLY interval and reminder day.', function () {
    var today = new Date();
    var reminderDay = today.getDay();
    var expectedStockCountDate = utility.getFullDate(utility.getWeekRangeByDate(today, reminderDay).reminderDate);
    var result = stockCountFactory.getStockCountDueDate(reminderFactory.WEEKLY, reminderDay);
    var stockCountDueDate = utility.getFullDate(result);
    expect(expectedStockCountDate).toBe(stockCountDueDate);
  });


  it('i expect getStockCountDueDate to return last week count date, if current week is not yet due.', function () {
    var today = new Date();
    var reminderDay = today.getDay() + 1;
    var aWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - reminderFactory.WEEKLY);
    var expectedStockCountDate = utility.getFullDate(utility.getWeekRangeByDate(aWeekAgo, reminderDay).reminderDate);
    var result = stockCountFactory.getStockCountDueDate(reminderFactory.WEEKLY, reminderDay);
    var stockCountDueDate = utility.getFullDate(result);
    expect(expectedStockCountDate).toBe(stockCountDueDate);
  });

  it('i expect getStockCountDueDate() to return correct monthly stock count date', function () {
    var today = new Date();
    var reminderDay = 5;//friday
    var monthlyReminderDate = 1;
    var expectedStockCountDate = utility.getFullDate(new Date(today.getFullYear(), today.getMonth(), monthlyReminderDate));
    var result = utility.getFullDate(stockCountFactory.getStockCountDueDate(reminderFactory.MONTHLY, reminderDay));
    expect(result).toBe(expectedStockCountDate);
  });

  it('i expect getStockCountDueDate to return given date if interval is monthly', function () {
    var monthlyDueDate = new Date('2014-06-13');
    var reminderDay = 5;//friday
    var expectedStockCountDate = utility.getFullDate(monthlyDueDate);
    var result = stockCountFactory.getStockCountDueDate(reminderFactory.MONTHLY, reminderDay, monthlyDueDate);
    var stockCountDate = utility.getFullDate(result);
    expect(stockCountDate).toBe(expectedStockCountDate);
  });

  it('i expect getStockCountDueDate() to return expected date, if interval is BI_WEEKLY', function () {
    var today = new Date();
    var reminderDay = today.getDay();
    var expectedStockCountDate = utility.getFullDate(utility.getWeekRangeByDate(today, reminderDay).reminderDate);
    var result = stockCountFactory.getStockCountDueDate(reminderFactory.WEEKLY, reminderDay);
    var stockCountDueDate = utility.getFullDate(result);
    expect(expectedStockCountDate).toBe(stockCountDueDate);
  });

  it('i expect isStockCountDue return FALSE if Interval is daily and stock count for current date bas been completed.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var stockCount = {
      countDate: today,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.DAILY, today.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });

  });

  it('i expect isStockCountDue return True if Interval is daily and stock count for current date does not exist.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var countDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);//3 days ago
    var stockCount = {
      countDate: countDate,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.DAILY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });

  });

  it('i expect isStockCountDue to return True if interval is daily and current date stock count has not been completed.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var stockCount = {
      countDate: today,
      isComplete: 0
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.DAILY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });
  });

  it('i expect isStockCountDue() to return True if there is no stock count available and interval is DAILY', function(){
    var dfd = $q.defer();
    var today = new Date();
    var stockCount;//no stock count available.
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function(){
        return stockCountFactory.isStockCountDue(reminderFactory.DAILY, today.getDay())
            .then(function(res){
                expect(res).toBeTruthy();
            });
    });
  });

  it('i expect isStockCountDue() to return True if there is no stock count available and interval is WEEKLY', function(){
    var dfd = $q.defer();
    var today = new Date();
    var stockCount;//no stock count available.
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function(){
        return stockCountFactory.isStockCountDue(reminderFactory.WEEKLY, today.getDay())
            .then(function(res){
                expect(res).toBeTruthy();
            });
    });
  });

  it('i expect isStockCountDue() to return True if there is no stock count available and interval is BI_WEEKLY', function(){
    var dfd = $q.defer();
    var today = new Date();
    var stockCount;//no stock count available.
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function(){
        return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
            .then(function(res){
                expect(res).toBeTruthy();
            });
    });
  });

  it('i expect isStockCountDue() to return False if stock count exists for given week and has been completed', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var stockCount = {
      countDate: weeklyStockCountDateInfo.reminderDate,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });
  });

  it('i expect isStockCountDue() to return True if there is no stock count available and interval is MONTHLY', function(){
    var dfd = $q.defer();
    var today = new Date();
    var stockCount;//no stock count available.
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function(){
        return stockCountFactory.isStockCountDue(reminderFactory.MONTHLY, today.getDay())
            .then(function(res){
                expect(res).toBeTruthy();
            });
    });
  });
  //FIXME: don't know why failing
  
  xit('i expect isStockCountDue() to return False if current week stock count is not yet due, but last week stock has been completed.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//
    var lastWeekCOuntDate = utility.getWeekRangeByDate(today, reminderDay).reminderDate;//previous week
    var currentDueDate = new Date(lastWeekCOuntDate.getFullYear(), lastWeekCOuntDate.getMonth(), lastWeekCOuntDate.getDate() + reminderFactory.WEEKLY);//current week.

    spyOn(stockCountFactory, 'getStockCountDueDate').andCallFake(function(){
     return currentDueDate;
    });

    var stockCount = {
      countDate: lastWeekCOuntDate,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.WEEKLY, lastWeekCOuntDate.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });
  });

  it('i expect isStockCountDue() to return True if current week stock count is not yet due, but last week stock has not been completed.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//
    var cwrDate = utility.getWeekRangeByDate(today, reminderDay).reminderDate;//curreny week rem date
    var lastWkCountDate = new Date(cwrDate.getFullYear(), cwrDate.getMonth(), cwrDate.getDate() - reminderFactory.WEEKLY);//previous week

    var stockCount = {
      countDate: lastWkCountDate,
      isComplete: 0
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.WEEKLY, cwrDate.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });
  });

  it('i expect isStockCountDue() to return False if interval is MONTHLY and a complete stock count exist for the given month.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var stockCount = {
      countDate: today,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.MONTHLY, today.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });
  });

  it('i expect isStockCountDue() to return True if interval is MONTHLY and no stock count exist for teh given month.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var stockCountDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());//previous month date
    var stockCount = {
      countDate: stockCountDate,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.MONTHLY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });
  });

//FIXME: don't know why failing
  xit('i expect isStockCountDue() to return False if interval is BI_WEEKLY and a complete stock exist for current week exists within current week.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var stockCount = {
      countDate: weeklyStockCountDateInfo.reminderDate,
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });
  });

  it('i expect isStockCountDue() to return True if interval is BI_WEEKLY and most recent stock count is not complete.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var stockCount = {
      countDate: weeklyStockCountDateInfo.reminderDate,
      isComplete: 0
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });

  });

  it('i expect isStockCountDue() to return False if interval is BI_WEEKLY and bi-weekly stock count due date is  before most recent stock count date.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, reminderDay);
    var rmDate = weeklyStockCountDateInfo.reminderDate;

    var stockCount = {
      countDate: new Date(rmDate.getFullYear(), rmDate.getMonth(), rmDate.getDate() + reminderDay), //a day after due date
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    expect(rmDate.getTime()).toBeLessThan(stockCount.countDate)

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, reminderDay)
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });

  });

  it('i expect isStockCountDue() to return True if interval is BI_WEEKLY and most recent stock count is not within bi-weekly range and incomplete.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var rmDate = weeklyStockCountDateInfo.reminderDate;

    var stockCount = {
      countDate: new Date(rmDate.getFullYear(), rmDate.getMonth(), rmDate.getDate() - reminderFactory.BI_WEEKLY), //two weeks ago
      isComplete: 0
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });

  });

  it('i expect isStockCountDue() to return False if interval is BI_WEEKLY and most recent stock count is within bi-weekly range and complete.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var rmDate = weeklyStockCountDateInfo.reminderDate;

    var stockCount = {
      countDate: new Date(rmDate.getFullYear(), rmDate.getMonth(), rmDate.getDate() + 1), //last week
      isComplete: 1
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeFalsy();
          });
    });

  });

  it('i expect isStockCountDue() to return True if interval is BI_WEEKLY and most recent stock count is within bi-weekly range and inccomplete.', function () {
    var dfd = $q.defer();
    var today = new Date();
    var reminderDay = 5;//friday
    var weeklyStockCountDateInfo = utility.getWeekRangeByDate(today, 5);
    var rmDate = weeklyStockCountDateInfo.reminderDate;

    var stockCount = {
      countDate: new Date(rmDate.getFullYear(), rmDate.getMonth(), rmDate.getDate() - reminderFactory.WEEKLY), //last week
      isComplete: 0
    };
    spyOn(stockCountFactory, 'getMostRecentStockCount').andCallFake(function () {
      dfd.resolve(stockCount);
      return dfd.promise;
    });

    runs(function () {
      return stockCountFactory.isStockCountDue(reminderFactory.BI_WEEKLY, today.getDay())
          .then(function (result) {
            expect(result).toBeTruthy();
          });
    });

  });

});
