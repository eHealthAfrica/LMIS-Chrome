'use strict';

angular.module('lmisChromeApp')
  .service('notificationService', function($window) {

    this.BEEP_MEDIA_URL = 'media/beep.wav';

    this.vibrate = function(duration) {
      if('notification' in $window.navigator) {
        $window.navigator.notification.vibrate(duration);
      }
    };

    this.beep = function(repeat) {
      if('notification' in $window.navigator) {
        $window.navigator.notification.beep(repeat);
      }
    };

  });
