'use strict';

angular.module('lmisChromeApp').service('trackingService', function ($window) {
   var _tracker; 
    angular.element(document).ready(function () {
        var _service = $window.analytics.getService('LoMIS');
      //put your own code here!
     _tracker = _service.getTracker('UA-51340003-1');
   });


  this.getTracker =  function(){
    return _tracker;
  };
});
