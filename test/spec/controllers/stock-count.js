'use strict';

describe('Controller: StockCountFormCtrl', function() {
  var scope;
  var ctrl;
  var state;
  var stockCount;
  var appConfig;
  var productType;
  var _i18n;
  var $controller;
  var mostRecentStockCount = {};
  var homeCtrlData =

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'stockCountMocks', 'i18nMocks', 'productWithCategoryMocks', 'fixtureLoaderMocks', function($provide) {
    //$provide.value('appConfig',{});
    $provide.value('productType', {});
  }));

  beforeEach((inject(function($templateCache, $httpBackend, fixtureLoaderMock) {
    $templateCache.put('views/index/loading-fixture-screen.html', '');
    fixtureLoaderMock.loadFixtures();
  })));

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

  beforeEach(inject(function(_$controller_, $state, _stockCountFactory_, _productType_, appConfigMock, stockData, i18n, productWithCategoryMock) {
    $controller = _$controller_;
    scope = {};
    _i18n = i18n;
    stockCount = stockData;
    state = $state;
    productType = _productType_;
    appConfig = appConfigMock;
    ctrl = $controller('StockCountFormCtrl', {
      $scope: scope,
      $state: state,
      stockCountFactory: _stockCountFactory_,
      appConfig: appConfig,
      productType: _productType_,
      productWithCategories: productWithCategoryMock
    });
    mostRecentStockCount = angular.copy(stockCount, mostRecentStockCount);
  }));

  it('should show variable initial value', function() {
    expect(scope.step).toEqual(0);
  });

  it('should change step value', function() {
    scope.stockCount = stockCount;
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.step).toEqual(1);
    scope.changeState(0);
    expect(scope.step).toEqual(0);
  });

  it('should change stock count last form position', function() {
    scope.stockCount = stockCount;
    expect(scope.stockCount.lastPosition).toEqual(0);
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.stockCount.lastPosition).toEqual(scope.step);
    expect(scope.stockCount.lastPosition).toEqual(1);
  });

  it('should set stock count object to complete', function() {
    scope.stockCount = stockCount;
    expect(scope.stockCount.isComplete).toEqual(0);
    scope.finalSave();
    expect(scope.stockCount.isComplete).toEqual(1);
  });

  it('should convert count value from product uom to presentation uom', function() {
    /*
     The first product in stockCountMocks is BCG 20
     BCG 20 presentation is in 20 doses per vials
     so 1000 doses = 50 vials
     productKey = uuid of selected product. default to first product
     */
    scope.stockCount = stockCount;
    scope.countValue[scope.productKey] = 50;
    scope.convertToPresentationUom();
    expect(scope.stockCount.unopened[scope.productKey]).toEqual(1000);
  });

  it('should return css class created from category name', function() {
    var categoryName = 'Dry Store Safety Boxes';
    var className = scope.getCategoryColor(categoryName);
    expect(className).toEqual('dry-store-safety-boxes');
  });

  describe('StockCountHomeCtrl', function() {
    describe('isEditable', function() {
      var ctrlData;
      var scope;
      var stockCountHomeCtrl;
      beforeEach(inject(function() {

        scope = {};
        ctrlData = {
          $scope: scope,
          appConfig: appConfig,
          stockCountByDate: {},
          mostRecentStockCount: mostRecentStockCount,
          isStockCountReminderDue: false
        };
        stockCountHomeCtrl = $controller('StockCountHomeCtrl', ctrlData);

      }));

      it('should be True if stock count is most recent stock count and stock count is not due.', function() {
        expect(stockCount.uuid).toBe(mostRecentStockCount.uuid);
        expect(ctrlData.isStockCountReminderDue).toBeFalsy();
        var result = scope.isEditable(stockCount);
        expect(result).toBeTruthy();
      });

      it('should return False if stockCount is not most recent and stock count reminder is not due.', function() {
        stockCount.uuid = '1266272';//alter stock count
        expect(stockCount.uuid).not.toBe(mostRecentStockCount.uuid);
        expect(ctrlData.isStockCountReminderDue).toBeFalsy();
        var result = scope.isEditable(stockCount);
        expect(result).toBeFalsy();
      });

      it('should return False if stock count reminder is True(i.e Due). and stock count is most recent stock count.', function(){
        ctrlData.isStockCountReminderDue = true;
        stockCountHomeCtrl = $controller('StockCountHomeCtrl', ctrlData);
        expect(ctrlData.isStockCountReminderDue).toBeTruthy();
        expect(stockCount.uuid).toBe(mostRecentStockCount.uuid);
        var result = scope.isEditable(stockCount);
        expect(result).toBeFalsy();
      });

      it('should return False if stock count is not most recent and stock count is due.', function(){
        ctrlData.isStockCountReminderDue = true;
        stockCount.uuid = '356271'; //alter stock count.
        stockCountHomeCtrl = $controller('StockCountHomeCtrl', ctrlData);
        expect(ctrlData.isStockCountReminderDue).toBeTruthy();
        expect(stockCount.uuid).not.toBe(mostRecentStockCount.uuid);
        var result = scope.isEditable(stockCount);
        expect(result).toBeFalsy();
      });

    });
  });

});
