'use strict';

describe('Device info factory', function() {

  it('should be defined', function() {
    module('lmisChromeApp');
    inject(function(deviceInfoFactory) {
      expect(deviceInfoFactory).toBeDefined();
    });
  });

  describe('without Cordova support', function() {

    it('should reject with a reason', function() {
      module('lmisChromeApp');
      inject(function(deviceInfoFactory) {

        runs(function() {
          return deviceInfoFactory.getDeviceInfo()
            .catch(function(reason) {
              expect(reason).toBeDefined();
            });
        });

      });
    });

  });

  describe('with Cordova support', function() {
    beforeEach(module('lmisChromeApp', 'deviceInfoMocks'));

    var deviceInfoFactory, deviceInfoMocks;
    beforeEach(inject(function(_deviceInfoFactory_, _deviceInfoMocks_) {
      deviceInfoFactory = _deviceInfoFactory_;
      deviceInfoMocks = _deviceInfoMocks_;
    }));

    it('should reject if getDeviceInfo failed', inject(function($window) {
      $window.cordova = deviceInfoMocks.failure;
      runs(function() {
        return deviceInfoFactory.getDeviceInfo()
          .catch(function(reason) {
            expect(reason).toBeDefined();
          });
      });
    }));
  });
});
