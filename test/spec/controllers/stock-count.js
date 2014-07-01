'use strict';

describe('Controller: StockCountFormCtrl', function(){
  var scope, ctrl, state, stockCount, appConfig, productType, _i18n;

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'stockCountMocks', 'i18nMocks', 'productWithCategoryMocks', 'fixtureLoaderMocks', function($provide){
    //$provide.value('appConfig',{});
    $provide.value('productType', {});
  }));

  beforeEach((inject(function($templateCache, $httpBackend, fixtureLoaderMock) {
    $templateCache.put('views/index/loading-fixture-screen.html', '');
    fixtureLoaderMock.loadFixtures();
  })));

  beforeEach(inject(function($controller, $state, _stockCountFactory_, _productType_, appConfigMock,
                             stockData, i18n, productWithCategoryMock){
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
  }));

  it('should show variable initial value', function (){
    expect(scope.step).toEqual(0);
  });

  it('should change step value', function (){
    scope.stockCount = stockCount;
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.step).toEqual(1);
    scope.changeState(0);
    expect(scope.step).toEqual(0);
  });

  it('should change stock count last form position', function(){
    scope.stockCount = stockCount;
    expect(scope.stockCount.lastPosition).toEqual(0);
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.stockCount.lastPosition).toEqual(scope.step);
    expect(scope.stockCount.lastPosition).toEqual(1);
  });

  it('should set stock count object to complete', function(){
    scope.stockCount = stockCount;
    expect(scope.stockCount.isComplete).toEqual(0);
    scope.finalSave();
    expect(scope.stockCount.isComplete).toEqual(1);
  });

  it('should convert count value from product uom to presentation uom', function(){
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

  it('should return css class created from category name', function(){
    var categoryName = 'Dry Store Safety Boxes';
    var className = scope.getCategoryColor(categoryName);
    expect(className).toEqual('dry-store-safety-boxes');
  });
});
