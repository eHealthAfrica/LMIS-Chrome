'use strict';

describe('StockCountStepsFormCtrl', function(){
  var scope;
  var ctrl;
  var state;
  var stockCountFactory;
  var currentFacility;
  var productType;
  var currentFacilityMock = {};
  var productTypeMock = {};

  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks', function($provide){
    $provide.value('currentFacility', currentFacilityMock);
    $provide.value('productType', productTypeMock);
  }));

  beforeEach(inject(function($controller, $state, _stockCountFactory_, _currentFacility_, _productType_){
    scope = {};
    state = $state;
    productType = _productType_;
    stockCountFactory = {};
    currentFacility = _currentFacility_;
    ctrl = $controller('StockCountStepsFormCtrl', {
      $scope: scope,
      $state: state,
      stockCountFactory:_stockCountFactory_,
      currentFacility:_currentFacility_,
      productType:_productType_
    });
  }));

  it('should return the default state of preview variable', function (){
    expect(scope.preview).not.toBeTruthy();
  });

  it('should return the default value of step variable', function (){
    expect(scope.step).toEqual(0);
  });

  it('should change step value equal parameter entered for edit()', function(){
    scope.edit(1);
    expect(scope.step).toEqual(1);
  });
});