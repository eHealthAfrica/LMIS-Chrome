'use strict';

describe('DeviceInfoService service', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp'));

  var deviceInfoService;
  beforeEach(inject(function(_deviceInfoService_) {
    deviceInfoService = _deviceInfoService_;
  }));

  it('should define a service', function() {
    expect(deviceInfoService).toBeDefined();
  });

  it('should reject when cordova is not supported', function() {
    runs(
        function () {
          return deviceInfoService.getDeviceInfo();
        },
        function checkExpectations(result) {
          expect(result).toBe(deviceInfoService.NOT_SUPPORTED_MSG);
          expect(result).not.toBe('just a check to make sure it test promise');
        }
    );
  });

});
