'use strict';

describe('Service: trackingFactory ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var trackingFactory;

  beforeEach(inject(function(_trackingFactory_) {
    trackingFactory = _trackingFactory_;
  }));

  iit('should define a tracker property', function() {
    expect('tracker' in trackingFactory).toBe(true);
  });

});
