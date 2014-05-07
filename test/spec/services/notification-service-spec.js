'use strict';

describe('Service: notificationService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var notificationService;

  beforeEach(inject(function(_notificationService_) {
    notificationService = _notificationService_;
  }));

  it('as a user, i expect notificationService to be defined ', function(){
    expect(notificationService).toBeDefined();
  });

  it('as a user, i expect notification service to have beep functionality', function(){
    spyOn(notificationService, 'beep').andCallFake(function(noOfRepeats){});
    var numberOfRepeats = 1;
    notificationService.beep(numberOfRepeats);
    expect(notificationService.beep).toHaveBeenCalled();
  });

  it('as a user, i expect notification service to have vibration functionality', function(){
    spyOn(notificationService, 'vibrate').andCallThrough();
    var oneSecond = 1000;
    notificationService.vibrate(oneSecond);
    expect(notificationService.vibrate).toHaveBeenCalledWith(oneSecond);
  });
  
});
