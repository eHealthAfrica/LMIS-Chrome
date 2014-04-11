'use strict'

angular.module('lmisChromeApp').service('notificationService', function () {

 this.BEEP_MEDIA_URL = 'media/beep.wav';

 this.vibrate = function(duration){
   try {
     navigator.notification.vibrate(duration);
   } catch (e) {
     console.log(e);
   }
 };

 this.beep = function(repeat){
   try {
     navigator.notification.beep(repeat);
   } catch (e) {
     console.log(e);
   }
  };

});