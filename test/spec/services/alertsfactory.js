'use strict';

describe('Service: alertsFactory', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  // instantiate service
  var alertsFactory, scope;
  beforeEach(inject(function(_alertsFactory_, $rootScope) {
    alertsFactory = _alertsFactory_;
    scope = $rootScope.$new();
  }));

  it('should attach an alerts array to the root scope', function() {
    expect(scope.alerts).toBeDefined();
    expect(scope.alerts.length).toEqual(0);
  });

  it('should provide an add method', function() {
    expect(alertsFactory.add).toBeDefined();
  });

  it('should add an alert to the root scope', function() {
    alertsFactory.add({message: 'Test'});
    expect(scope.alerts.length).toEqual(1);
  });

  it('should provide a remove method', function() {
    expect(alertsFactory.remove).toBeDefined();
  });

  it('should remove an alert by its index', function() {
    expect(scope.alerts.length).toEqual(0);
    alertsFactory.add({message: 'Test'});
    alertsFactory.remove(0);
    expect(scope.alerts.length).toEqual(0);
  });

  it('should not clobber other alerts when removing', function() {
    var nucleobases = ['Guanine', 'Adenine', 'Thymine', 'Cytosine'];
    nucleobases.forEach(function(nucleobase) {
      alertsFactory.add({message: nucleobase});
    });
    expect(scope.alerts.length).toEqual(4);
    alertsFactory.remove(2);
    expect(scope.alerts.length).toEqual(3);
    var cytosine = scope.alerts[2];
    expect(cytosine.message).toEqual(nucleobases[3]);
  });

  it('should provide a clear all alerts method', function() {
    expect(alertsFactory.clear).toBeDefined();
  });

  it('should clear alerts when asked', function() {
    var nucleobases = ['Guanine', 'Adenine', 'Thymine', 'Cytosine'];
    nucleobases.forEach(function(nucleobase) {
      alertsFactory.add({message: nucleobase});
    });
    expect(scope.alerts.length).toEqual(4);
    alertsFactory.clear();
    expect(scope.alerts.length).toEqual(0);
  });

  it('should expose a remove method aliased as "closeAlert"', function() {
    expect(scope.closeAlert).toBeDefined();
  });
});
