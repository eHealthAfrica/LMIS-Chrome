'use strict';

angular.module('lmisChromeApp').service('trackingService', function($window) {
  var tracker;
  angular.element(document).ready(function() {
    if ('analytics' in $window) {
      var service = $window.analytics.getService('LoMIS');
      //put your own code here!
      tracker = service.getTracker('UA-51340003-1');
    }
  });

  this.getTracker = function() {
    return tracker;
  };
});
