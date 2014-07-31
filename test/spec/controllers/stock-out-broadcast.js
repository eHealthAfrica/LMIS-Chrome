describe('multiStockOutBroadcast', function(){
  var scope, ctrl, state, stateParams, appConfig, _i18n, stockOutBroadcastFactory,
      notificationService, $q;

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'i18nMocks', 'productTypeMocks', function($provide){
    //$provide.value('facilityStockListProductTypes', []);
  }));

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
      'index/loading-fixture-screen',
      'index/migration-screen'
    ];

    angular.forEach(templates, function (template) {
      $templateCache.put('views/' + template + '.html', '');
    });
  }));

  beforeEach(inject(function($controller, $state, $stateParams, productTypeMock, appConfigMock, i18n,
      _stockOutBroadcastFactory_, _notificationService_, _$q_){
    scope = {};
    state = $state;
    $q = _$q_;
    notificationService = _notificationService_;
    appConfig = appConfigMock;
    _i18n = i18n;
    stockOutBroadcastFactory = _stockOutBroadcastFactory_;
    stateParams = $stateParams;
    stateParams.productList = '0930b906-4802-4a65-8516-057bd839db3e,939d5e05-2aa4-4883-9246-35c60dfa06a5';

    ctrl = $controller('MultiStockOutBroadcastCtrl', {
      $scope: scope,
      $state: state,
      appConfig: appConfig,
      i18n: _i18n,
      stateParams: stateParams,
      stockOutBroadcastFactory: stockOutBroadcastFactory,
      facilityStockListProductTypes: productTypeMock,
      notificationService: notificationService
    });
  }));

  it('should covert convert uuid from url to array', function(){
    expect(scope.urlParams.length).toEqual(2);
  });

  it('should invoke notificationService.getConfirmDialog when saving stock out', function(){
    spyOn(notificationService, 'getConfirmDialog').andCallFake(function(a, b, c){
      return $q.when(true);
    });
    expect(notificationService.getConfirmDialog).not.toHaveBeenCalled();
    scope.save();
    expect(notificationService.getConfirmDialog).toHaveBeenCalled();
  });
});
