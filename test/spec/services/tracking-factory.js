'use strict';

describe('Service: trackingFactory ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var trackingFactory;

  beforeEach(inject(function(_trackingFactory_) {
    trackingFactory = _trackingFactory_;
  }));

  it('should define a tracker function', function() {
    expect(angular.isFunction(trackingFactory.tracker)).toBe(true);
  });

});
