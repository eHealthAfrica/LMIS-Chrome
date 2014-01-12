'use strict';

describe('Service: settingsFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var settingsFactory;
  beforeEach(inject(function (_settingsFactory_) {
    settingsFactory = _settingsFactory_;
  }));

  it('should do something', function () {
    expect(!!settingsFactory).toBe(true);
  });

});
