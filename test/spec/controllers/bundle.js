'use strict';

ddescribe('Inventory controller', function () {

  var $state, logBundleCtrl, scope, i18n, growl;

  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'stockCountMocks', 'i18nMocks', 'productWithCategoryMocks', 'fixtureLoaderMocks', 'growlMocks', 'i18nMockedWindow', function($provide) {
    //$provide.value('appConfig',{});
    $provide.value('productType', {});
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
      'views/bundles/index',
      'views/log-incoming',
      'views/partials/index',
      'views/partials/log-incoming'
    ];

    angular.forEach(templates, function (template) {
      $templateCache.put('views/' + template + '.html', '');
    });
  }));

  beforeEach(inject(function(_$state_, $controller, $rootScope, i18nMock, growlMock) {
    $state = _$state_;
    scope = {};
    i18n = i18nMock;
    growl = growlMock;

    logBundleCtrl = $controller('LogBundleHomeCtrl', {
      $scope: scope,
      growl: growl,
      il8n: i18n,
      batchStore: {},
      appConfig : {
        facility: {
          selectedLgas : [
            {uuid : 1, name: 'fagge'}
          ]
        }
      },
      bundles: {

      }

    });
  }));


  it('logBundleHome state should point to log-bundle-home url', function() {
    var state = $state.get('logBundleHome');
    expect($state.href(state)).toEqual('#/log-bundle-home');
  });
  it('injected modules should be defined', function(){
     expect(growl).not.toBe(undefined);
  })

});
