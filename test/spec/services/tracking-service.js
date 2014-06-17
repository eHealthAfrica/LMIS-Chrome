'use strict';

describe('Service: trackingService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var trackingService;

  beforeEach(inject(function(_trackingService_) {
    trackingService = _trackingService_;
  }));

  it('should define a getTracker function', function() {
    expect(angular.isFunction(trackingService.getTracker)).toBe(true);
  });

});
