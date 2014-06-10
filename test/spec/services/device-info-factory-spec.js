'use strict';

describe('Device info factory', function() {

  it('should be defined', function() {
    module('lmisChromeApp', 'i18nMocks');
    inject(function(deviceInfoFactory) {
      expect(deviceInfoFactory).toBeDefined();
    });
  });

  describe('without Cordova support', function() {

    it('should reject with a reason', function() {
      module('lmisChromeApp', 'i18nMocks');
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
    beforeEach(module('lmisChromeApp', 'deviceInfoMocks', 'i18nMocks'));

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

    it('should return the first device email', inject(function($window) {
      $window.cordova = deviceInfoMocks.sparseEmail;
      runs(function() {
        return deviceInfoFactory.getDeviceInfo()
          .then(function(result) {
            expect(result.mainAccount).toBe('test@example.com');
          });
      });
    }));

    it('should reject if there are no emails', inject(function($window) {
      $window.cordova = deviceInfoMocks.emptySuccess;
      runs(function() {
        return deviceInfoFactory.getDeviceInfo()
          .catch(function(reason) {
            expect(reason).toBeDefined();
          });
      });
    }));

  });
});
