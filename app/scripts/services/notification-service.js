'use strict'

angular.module('lmisChromeApp').service('notificationService', function ($window, $log) {
 this.BEEP_MEDIA_URL = '/media/beep.wav';
 $window.navigator.vibrate = $window.navigator.vibrate || $window.navigator.webkitVibrate
     || $window.navigator.mozVibrate || $window.navigator.msVibrate;

 this.vibrate = function(milliseconds){
  if($window.navigator.vibrate){
    $window.navigator.vibrate(milliseconds);
  }
 };

 this.beep = function(){
   try {
     var sound = new Howl({urls: [this.BEEP_MEDIA_URL]});
     sound.play();
   } catch (e) {
     $log.error(e);
   }
//   if ($window.Audio) {
//     var audio = new $window.Audio(this.BEEP_MEDIA_URL);
//     audio.play();
//   }
  };

});