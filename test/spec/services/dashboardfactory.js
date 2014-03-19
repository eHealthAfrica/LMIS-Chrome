'use strict';

describe('Service: dashboardfactory', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'seriesMocks'));

  beforeEach(inject(function($templateCache, $httpBackend) {
    // Mock each template used by the state
    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/home/' + template + '.html', '');
    });

    $httpBackend.whenGET('/locales/en.json').respond(200, {});
    $httpBackend.whenGET('/locales/en_GB.json').respond(200, {});
  }));

  // instantiate service
  var $q, $rootScope, dashboardfactory, seriesKeys, seriesValues;
  beforeEach(inject(function(_$q_, _$rootScope_, _dashboardfactory_, seriesKeysMock, seriesValuesMock) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    dashboardfactory = _dashboardfactory_;
    seriesKeys = seriesKeysMock;
    seriesValues = seriesValuesMock;
  }));

  it('should plot the required keys', function() {
    var required = ['below', 'buffer', 'safety', 'max'], keysMock = {};
    required.forEach(function(key) {
      keysMock[key] = {};
    });

    var deferred = $q.defer();
    deferred.resolve(keysMock);
    spyOn(dashboardfactory, 'keys').andReturn(deferred.promise);

    $rootScope.$apply(function() {
      dashboardfactory.keys().then(function(result) {
        expect(result).toBe(keysMock);
      });
    });
  });

  it('should create an nvd3 formatted series object', function() {
    var key = seriesKeys[0];
    var series = dashboardfactory.series(key, seriesValues);
    expect(angular.isObject(series)).toBe(true);
    expect(series.key).toBe(key.label);
    expect(series.color).toBe(key.color);
    expect(angular.isArray(series.values)).toBe(true);
    expect(series.values.length).toEqual(seriesValues.length);
    // ['label', value]
    var value = series.values[0];
    expect(angular.isArray(value)).toBe(true);
    expect(angular.isString(value[0])).toBe(true);
    expect(angular.isNumber(value[1])).toBe(true);
  });

  describe('#chart', function() {
    it('should construct chart data', function() {
      var chart = dashboardfactory.chart(seriesKeys, seriesValues);
      expect(angular.isArray(chart)).toBe(true);
      expect(chart.length).toEqual(seriesKeys.length);
    });

    it('should maintain key order', function() {
      var chart = dashboardfactory.chart(seriesKeys, seriesValues);
      expect(chart[0].key).toEqual(seriesKeys[0].label);
    });
  });
});
