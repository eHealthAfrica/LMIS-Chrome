'use strict';

describe('StockCountStepsFormCtrl', function(){
  var scope;
  var ctrl;
  var state;
  var stockCountFactory = {};
  var appConfig = {};
  var productType;
  var appConfigMock = {selectedProductProfiles: []};
  var productTypeMock = {};

  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks', function($provide){
    $provide.value('currentFacility', currentFacilityMock);
    $provide.value('productType', productTypeMock);
  }));

  beforeEach(inject(function($controller, $state, _stockCountFactory_, _productType_, _alertsFactory_, _appConfig_){
    scope = {};
    state = $state;
    productType = _productType_;
    appConfig = _appConfig_;
    ctrl = $controller('StockCountStepsFormCtrl', {
      $scope: scope,
      $state: state,
      stockCountFactory:_stockCountFactory_,
      appConfig:appConfig,
      productType:_productType_
    });
  }));

  /*it('should show that facility object exist', function (){
    expect(scope.facilityProducts).not.toBeDefined();
  });

  /*it('should return the default value of step variable', function (){
    expect(scope.step).toEqual(0);
  });

  it('should change step value equal parameter entered for edit()', function(){
    scope.edit(1);
    expect(scope.step).toEqual(1);
  });
  */
});