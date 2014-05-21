'use strict';

describe('Tests Counter Directive', function () {
  var scope, html, counter,  counterScope, $timeout, shouldCountUp;

  // Load the LMIS module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

 // Initialize the state
  beforeEach(inject(function($templateCache) {
    // Mock each template used by the state
    var templates = [
      'index/index',
      'index/header',
      'index/breadcrumbs',
      'index/alerts',
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

  beforeEach(inject(function ($compile, $rootScope, _$timeout_) {
    //create a scope
    scope = $rootScope.$new();
    scope.counterResult = '';
    //set our view html.
    html = '<counter bind="counterResult"></counter>';
    counter = $compile(html)(scope);
    scope.$apply();
    //retrieve the counter's isolated scope.
    counterScope = counter.scope().$$childHead;
    $timeout = _$timeout_;
    shouldCountUp = true;
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
    expect(minusBtn.attr('id')).toBe('_$counterMinusBtn');
    expect(plusBtn.attr('id')).toBe('_$counterAddBtn');
  });

  it('i expect count value to be zero when counting down initially', function(){
    counterScope.startCounter(!shouldCountUp);// count downward
    $timeout(function(){
      counterScope.stopCounter();
    }, 1000);
    $timeout.flush();
    expect( counterScope.count).toBe(0);
  });

  it('i expect count value to be zero when counting down with non-numeric initial count value', function(){
    counterScope.count = '44HJJ56';
    counterScope.startCounter(!shouldCountUp);// count downward
    $timeout(function(){
      counterScope.stopCounter();
    }, 1000);
    $timeout.flush();
    expect( counterScope.count).toBe(0);
  });

  it('i expect count down when triggered not to count below zero.', function(){
    counterScope.count = 4;
    counterScope.startCounter(!shouldCountUp);// count downward
    $timeout(function(){
      counterScope.stopCounter();
    }, 5000);
    $timeout.flush();
    expect(counterScope.count).not.toBeLessThan(0);
  });

  it('i expect count down when triggered to reduce count value', function(){
    var initialValue = 4335;
    counterScope.count = initialValue;
    counterScope.startCounter(!shouldCountUp);// count downward
    $timeout(function(){
      counterScope.stopCounter();
    }, 500);
    $timeout.flush();
    expect(counterScope.count).toBeLessThan(initialValue);
    expect(counterScope.count).not.toBe(0); //cause 500ms delay is not enough to reduce count to 0
  });

  it('i expect counting up to reset to 1 when called with non-numeric value/empty string', function(){
    counterScope.count = '44HJJ56';
    counterScope.startCounter(shouldCountUp);// count up
    $timeout(function(){
      counterScope.stopCounter();
    }, 1000);
    $timeout.flush();
    expect( counterScope.count).toBe(1);
  });

  it('i expect count up when triggered to increase count value', function(){
    var initialValue = 4335;
    counterScope.count = initialValue;
    counterScope.startCounter(shouldCountUp);// count downward
    $timeout(function(){
      counterScope.stopCounter();
    }, 500);
    $timeout.flush();
    expect(counterScope.count).toBeGreaterThan(initialValue);
  });

});

