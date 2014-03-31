'use strict';

describe('Service: notificationService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var notificationService;

  beforeEach(inject(function(_notificationService_) {
    notificationService = _notificationService_;
  }));

  it('as a user, i expect notificationService to be defined ', function(){
    expect(notificationService).toBeDefined();
  });

  it('as a user, i expect notification service to have beep functionality', function(){
    expect(notificationService.beep).toBeDefined();
    spyOn(notificationService, 'beep').andCallThrough();
    notificationService.beep();
    expect(notificationService.beep).toHaveBeenCalled();
  });

  it('as a user, i expect notification service to have vibration functionality', function(){
    expect(notificationService.vibrate).toBeDefined();
    spyOn(notificationService, 'vibrate').andCallThrough();
    var oneSecond = 1000;
    notificationService.vibrate(oneSecond);
    expect(notificationService.vibrate).toHaveBeenCalledWith(oneSecond);
  });

  it('as a user, i expect notification service to have beep sound media url defined', function(){
    expect(notificationService.BEEP_MEDIA_URL).toBeDefined();
  });

});
