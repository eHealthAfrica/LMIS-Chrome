'use strict';

describe('Controller: StockCountFormCtrl', function(){
  var scope, ctrl, state, stockCount, appConfig, productType, _i18n;

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'stockCountMocks', 'i18nMocks', function($provide){
    //$provide.value('appConfig',{});
    $provide.value('productType', {});
  }));

  beforeEach(inject(function($controller, $state, _stockCountFactory_, _productType_, _alertsFactory_, appConfigMock,
                             stockData, i18n){
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
      productType: _productType_
    });
  }));

  it('should show variable initial value', function (){
    expect(scope.step).toEqual(0);
  });

  it('should change step value', function (){
    scope.stockCount = stockCount;
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.step).toEqual(2);
    scope.changeState(0);
    expect(scope.step).toEqual(1);
  });

  it('should change stock count last form position', function(){
    scope.stockCount = stockCount;
    expect(scope.stockCount.lastPosition).toEqual(1);
    scope.changeState(1);
    scope.changeState(1);
    expect(scope.stockCount.lastPosition).toEqual(scope.step);
    expect(scope.stockCount.lastPosition).toEqual(2);
  });

  it('should set stock count object to complete', function(){
    scope.stockCount = stockCount;
    expect(scope.stockCount.isComplete).toEqual(0);
    scope.finalSave();
    expect(scope.stockCount.isComplete).toEqual(1);
  });

});