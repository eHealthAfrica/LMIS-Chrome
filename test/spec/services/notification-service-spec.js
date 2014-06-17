'use strict';

describe('Service: notificationService ', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var notificationService, $q;

  beforeEach(inject(function(_notificationService_, _$q_) {
    notificationService = _notificationService_;
    $q = _$q_;
  }));

  it('as a user, i expect notificationService to be defined ', function () {
    expect(notificationService).toBeDefined();
  });

  it('as a user, i expect notification service to have beep functionality', function () {
    spyOn(notificationService, 'beep').andCallFake(function (noOfRepeats) {
    });
    var numberOfRepeats = 1;
    notificationService.beep(numberOfRepeats);
    expect(notificationService.beep).toHaveBeenCalled();
  });

  it('as a user, i expect notification service to have vibration functionality', function () {
    spyOn(notificationService, 'vibrate').andCallThrough();
    var oneSecond = 1000;
    notificationService.vibrate(oneSecond);
    expect(notificationService.vibrate).toHaveBeenCalledWith(oneSecond);
  });

  it('i expect notification service.sendSms to return error msg if sms support is not available', function () {
    runs(
        function () {
          return notificationService.sendSms('08012345678', 'test sms alert msg, ignore');
        },
        function checkExpectations(result) {
          expect(result).toBe(notificationService.NO_SMS_SUPPORT);
          expect(result).not.toBe('SMS supported');
        }
    );
  });

  it('i expect notification service to send sms if sms support is available', function () {
    spyOn(notificationService, 'sendSms').andCallFake(function (phoneNo, msg) {
      return $q.when(true);
    });
    var phoneNo = '08032145678', msg = 'text msg to be delivered';
    notificationService.sendSms(phoneNo, msg);
    expect(notificationService.sendSms).toHaveBeenCalledWith(phoneNo, msg);
  });

});
