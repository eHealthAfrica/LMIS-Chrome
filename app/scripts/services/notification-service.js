'use strict';

angular.module('lmisChromeApp').service('notificationService', function () {
  this.BEEP_MEDIA_URL = 'media/beep.wav';

  this.vibrate = function(duration){
    if(navigator.notification) {
      navigator.notification.vibrate(duration);
    }
  };

  this.beep = function(repeat){
    if(navigator.notification){
      navigator.notification.beep(repeat);
    }
  };

});