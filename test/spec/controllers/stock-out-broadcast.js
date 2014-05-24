describe('multiStockOutBroadcast', function(){
  var scope, ctrl, state, stateParams, appConfig, _i18n;

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'i18nMocks', 'productTypeMocks', function($provide){
    //$provide.value('facilityStockListProductTypes', []);
  }));

  beforeEach(inject(function($controller, $state, $stateParams, productTypeMock, _alertsFactory_, appConfigMock, i18n){
    scope = {};
    state = $state;
    appConfig = appConfigMock;
    _i18n = i18n;
    stateParams = $stateParams;
    stateParams.productList = '0930b906-4802-4a65-8516-057bd839db3e,939d5e05-2aa4-4883-9246-35c60dfa06a5';
    ctrl = $controller('MultiStockOutBroadcastCtrl', {
      $scope: scope,
      $state: state,
      appConfig: appConfig,
      i18n: _i18n,
      stateParams: stateParams,
      facilityStockListProductTypes: productTypeMock
    });
  }));

  it('should covert convert uuid from url to array', function(){
    expect(scope.urlParams.length).toEqual(2);
  });
});