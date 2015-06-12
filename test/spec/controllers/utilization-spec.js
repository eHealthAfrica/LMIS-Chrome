'use strict';

describe('Controller:', function() {
  var scope;
  var ctrl;
  var state;
  var appConfig;
  var _utilizationList;
  var _i18n;
  var $controller;

  beforeEach(module('lmisChromeApp', 'appConfigMocks', 'i18nMocks', 'fixtureLoaderMocks', function($provide) {
    $provide.value('utilizationList', []);
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

  describe('UtilizationCtrl', function() {

    beforeEach(inject(function(_$controller_, _utilizationService_, utilizationList, $state, appConfigMock, i18n) {
      $controller = _$controller_;
      scope = {};
      _i18n = i18n;
      state = $state;
      _utilizationList = utilizationList;
      appConfig = appConfigMock;
      ctrl = $controller('UtilizationCtrl', {
        $scope: scope,
        $state: state,
        appConfig: appConfig
      });
    }));

    describe('showButton', function() {

      it('should be defined', function(){
        expect(scope.showButton).toBeDefined();
      });

      it('should return TRUE if page is index when button parameter is add', function(){
        scope.viewControl.page = 'index';
        expect(scope.showButton('add')).toBeTruthy();
      });

      it('should return FALSE if page is not index when button parameter is add', function(){
        scope.viewControl.page = 'preview';
        expect(scope.showButton('add')).toBeFalsy();
      });
    });

    describe('navBack', function() {

      it('should navigate to parent when called', function() {
        scope.viewControl.pages = {
          index: {
            title: 'Landing page',
            parent: 'home'
          },
          preview: {
            parent: 'index'
          }
        };
        scope.viewControl.page = 'preview';
        scope.navBack();
        expect(scope.viewControl.page).toEqual('index');
        scope.navBack();
        expect(scope.viewControl.page).toEqual('home');
      });
    });


  });

  describe('UtilizationFormCtrl', function() {
    beforeEach(inject(function(_$controller_, _utilizationService_, utilizationList, $state, appConfigMock, i18n) {
      $controller = _$controller_;
      scope = {};
      _i18n = i18n;
      state = $state;
      _utilizationList = utilizationList;
      appConfig = appConfigMock;
      ctrl = $controller('UtilizationFormCtrl', {
        $scope: scope,
        $state: state,
        appConfig: appConfig
      });
    }));

    describe('changeStep', function() {
      it('should increment step by one if "next" is passed to function', function() {
        expect(scope.viewControl.step).toEqual(0);
        scope.changeStep('next');
        expect(scope.viewControl.step).toEqual(1);
      });

      it('should decrease step by one if "prev" is passed to function', function() {
        scope.viewControl.max = 10;
        scope.changeStep('next');
        scope.changeStep('next');
        expect(scope.viewControl.step).toEqual(2);
        scope.changeStep('prev');
        expect(scope.viewControl.step).toEqual(1);
      });

      it('should not increment if error exists', function() {
        scope.viewControl.validationError = {0: 'kjj'};
        scope.changeStep('next');
        scope.changeStep('next');
        scope.changeStep('next');
        expect(scope.viewControl.step).toEqual(0);
      });
    });



  });


});
