'use strict';

describe('Tests Counter Directive', function () {
  var scope;
  var html;
  var counter;
  var counterScope;
  var notificationService;

  // Load the LMIS module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'fixtureLoaderMocks'));
  beforeEach(module('views/templates/counter.html'));

 // Initialize the state
  beforeEach(inject(function($templateCache, $httpBackend, storageService, fixtureLoaderMock) {
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

    fixtureLoaderMock.loadFixtures();

  }));

  beforeEach(inject(function ($compile, $rootScope, _notificationService_) {
    //create a scope
    scope = $rootScope.$new();
    scope.counterResult = '';
    //set our view html.
    html = '<counter bind="counterResult"></counter>';
    counter = $compile(html)(scope);
    scope.$apply();
    //retrieve the counter's isolated scope.
    counterScope = counter.scope().$$childHead;
    notificationService = _notificationService_;
    spyOn(notificationService, 'vibrate').andCallThrough();
  }));

  it('as a user, i want counter to have two button ', function () {
    expect(counter.find('button').length).toBe(2);
  });

  it('as a user, i want counter to have have one text input ', function(){
    expect(counter.find('input').length).toBe(1);
  });

  it('as a user, i want counter text input field to be of type "number" ', function(){
    var counterInputField = counter.find('input').eq(0);
    expect(counterInputField.attr('type')).toBe('number');
  });

  it('i want counter buttons to be accessible via unique ids ', function(){
    var minusBtn = counter.find('button').eq(0);
    var plusBtn = counter.find('button').eq(1);
    expect(minusBtn.attr('id')).toBe('counter-minus-button');
    expect(plusBtn.attr('id')).toBe('counter-plus-button');
  });

  it('i expect count value to be zero when counting down initially', function(){
    expect(counterScope.count).toBe('');
    counterScope.count = counterScope.decrementTouch();
    expect(counterScope.count).toBe(0);
  });

  it('i expect count value to be zero when counting down with non-numeric initial count value', function(){
    counterScope.count = '44HJJ56';
    expect(counterScope.count).not.toBe(0)
    counterScope.count = counterScope.decrementTouch();
    expect(counterScope.count).toBe(0);
  });

  it('i expect count down when triggered not to count below zero.', function(){
    counterScope.count = 0;
    counterScope.count = counterScope.decrementTouch();
    expect(counterScope.count).not.toBeLessThan(0);
  });

  it('i expect count down when triggered to reduce count value', function(){
    var initialValue = 4335;
    counterScope.count = initialValue;
    var res = counterScope.decrementTouch();
    counterScope.count = res;
    expect(counterScope.count).toBeLessThan(initialValue);
  });

  it('i expect counting up to reset to 1 when called with non-numeric value/empty string', function(){
    counterScope.count = '44HJJ56';
    var res = counterScope.incrementTouch();
    counterScope.count = res;
    expect(counterScope.count).toBe(1);
  });

  it('i expect count up when triggered to increase count value', function(){
    var initialValue = 0;
    counterScope.count = initialValue;
    counterScope.count = counterScope.incrementTouch();
    var expected = initialValue + 1;
    expect(counterScope.count).toBe(expected);
  });

  it('incrementTouch should vibrate when called.', function(){
    expect(notificationService.vibrate).not.toHaveBeenCalled();
    counterScope.incrementTouch();
    expect(notificationService.vibrate).toHaveBeenCalled();
  });

  it('decrementTouch should vibrate when called.', function(){
    expect(notificationService.vibrate).not.toHaveBeenCalled();
    counterScope.decrementTouch();
    expect(notificationService.vibrate).toHaveBeenCalled();
  });

});

