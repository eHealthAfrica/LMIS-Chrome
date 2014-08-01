describe('ClearStorage', function() {
  var scope;
  var clearStorageCtrl;
  var i18n;
  var notificationService;
  var $q;
  var $state;
  var storageService;
  var cacheService;
  var growl;
  var alertFactory;
  var backgroundSyncService;
  var memoryStorageService;
  var fixtureLoaderService;

  beforeEach(module('lmisChromeApp', 'i18nMocks'));

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
      'index/loading-fixture-screen',
      'notification-service/confirm-dialog'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/' + template + '.html', '');
    });

  }));

  beforeEach(inject(function($controller, _storageService_, _i18n_, _$state_, _notificationService_, _backgroundSyncService_, _cacheService_, _$q_, _memoryStorageService_, _growl_, _fixtureLoaderService_, _alertFactory_) {
    scope = {};
    storageService = _storageService_
    i18n = _i18n_;
    $state = _$state_;
    notificationService = _notificationService_;
    backgroundSyncService = _backgroundSyncService_;
    cacheService = _cacheService_;
    $q = _$q_;
    memoryStorageService = _memoryStorageService_;
    growl = _growl_;
    fixtureLoaderService = _fixtureLoaderService_;
    alertFactory = _alertFactory_;

    clearStorageCtrl = $controller('ClearStorage', {
      $scope: scope,
      storageService: storageService,
      i18n: i18n,
      $state: $state,
      notificationService: notificationService,
      backgroundSyncService: backgroundSyncService,
      cacheService: cacheService,
      $q: $q,
      memoryStorageService: memoryStorageService,
      growl: growl,
      fixtureLoaderService: fixtureLoaderService,
      alertFactory: alertFactory
    });

    spyOn(storageService, 'clear').andCallFake(function() {
      return $q.when();
    });

  }));

  describe('clearAndLoadFixture', function() {

    it('should call storageService.clear().', function() {
      expect(storageService.clear).not.toHaveBeenCalled();
      scope.clearAndLoadFixture();
      expect(storageService.clear).toHaveBeenCalled();
    });

    it('should call backgroundSyncService.cancel().', function() {
      spyOn(backgroundSyncService, 'cancel').andCallThrough();
      expect(backgroundSyncService.cancel).not.toHaveBeenCalled();
      scope.clearAndLoadFixture();
      expect(backgroundSyncService.cancel).toHaveBeenCalled();
    });

    it('should call cacheService.clearCache().', function() {
      spyOn(cacheService, 'clearCache').andCallThrough();
      expect(cacheService.clearCache).not.toHaveBeenCalled();
      scope.clearAndLoadFixture();
      expect(cacheService.clearCache).toHaveBeenCalled();
    });

    it('should call memoryStorageService.clearAll().', function() {
      spyOn(memoryStorageService, 'clearAll').andCallThrough();
      expect(memoryStorageService.clearAll).not.toHaveBeenCalled();
      scope.clearAndLoadFixture();
      expect(memoryStorageService.clearAll).toHaveBeenCalled();
    });

  });

});
