describe('Tests Counter Directive', function () {
  var scope, html, counter, counterIsolatedScope;

  // Load the LMIS module
  beforeEach(module('lmisChromeApp'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache, $httpBackend) {
    // Mock each template used by the state
    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(templates, function (template) {
      $templateCache.put('views/home/' + template + '.html', '');
    });

    $httpBackend.whenGET('/locales/en.json').respond(200, {});
    $httpBackend.whenGET('/locales/en_GB.json').respond(200, {});

    //create a scope
    scope = $rootScope.$new();

    scope.counterResult = '';

    //set our view html.
    html = '<counter bind="counterResult"></div>';
    counter = $compile(html)(scope);

    scope.$apply();
    //retrieve the counter's isolated scope.
    counterIsolatedScope = counter.scope().$$childHead;
  }));

  it('as a user, i want counter to have two button ', function () {
    expect(counter.find('button').length).toBe(2);
  });

  it('as a user, i want counter to have have input field', function(){
    expect(counter.find('input').length).toBe(1);
  });

  it('i want counter buttons to be accessible via unique ids ', function(){
    var minusBtn = counter.find('button').eq(0);
    var plusBtn = counter.find('button').eq(1)
    expect(minusBtn.attr('id')).toBe('_$counterMinusBtn');
    expect(plusBtn.attr('id')).toBe('_$counterAddBtn');
  });

  it('i expect counter minus function to reduce given value by 1', function(){
    var currentCount = 3;
    expect(counterIsolatedScope. _tapInputSub(currentCount)).toBe(currentCount - 1);
  });

  it('i expect counter minus function to reset to 0 when called with non-numeric value/empty string', function(){
    expect(counterIsolatedScope. _tapInputSub('44HJJ56')).toBe(0);
    expect(counterIsolatedScope. _tapInputSub('')).toBe(0);
  });

  it('as a user, i expect minus function when triggered not to count below zero.', function(){
    expect(counterIsolatedScope. _tapInputSub(0)).toBe(0);
  });

  it('i expect counter plus function to increase given value by 1', function(){
    var currentCount = 3;
    expect(counterIsolatedScope. _tapInputAdd(currentCount)).toBe(currentCount + 1);
  });

  it('i expect counter plus function to reset to 1 when called with non-numeric value/empty string', function(){
    expect(counterIsolatedScope. _tapInputAdd('44HJJ56')).toBe(1);
    expect(counterIsolatedScope. _tapInputAdd('')).toBe(1);
  });

});

