'use strict';

describe('i18n directive', function() {
  beforeEach(module('lmisChromeApp', 'i18nMockedWindow'));

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
      'index/migration-screen'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/' + template + '.html', '');
    });
  }));

  var html;
  beforeEach(inject(function($compile, $rootScope) {
    var scope = $rootScope.$new();
    html = '<p i18n="humdrum"></p>';
    html = $compile(html)(scope);
  }));

  it('should replace the elements text', function() {
    expect(html.text()).toBe('humdrum');
  });
});
