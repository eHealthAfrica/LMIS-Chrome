'use strict';

describe('DeviceInfoFactory service', function() {
  // Load the controller's module
  beforeEach(module('lmisChromeApp'));

  var deviceInfoFactory;
  beforeEach(inject(function(_deviceInfoFactory_) {
    deviceInfoFactory = _deviceInfoFactory_;
  }));

  it('should define a factory', function() {
    expect(deviceInfoFactory).toBeDefined();
  });

  it('should reject when cordova is not supported', function() {
    runs(function() {
      return deviceInfoFactory.getDeviceInfo()
        .catch(function(reason) {
          expect(reason).toBeDefined();
        });
    });
  });

});
