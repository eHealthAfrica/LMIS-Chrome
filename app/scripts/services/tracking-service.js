'use strict';

angular.module('lmisChromeApp').service('trackingService', function () {

  var _service = analytics.getService('LoMIS');
  //put your own code here!
  var _tracker = _service.getTracker('UA-51340003-1');

  this.getTracker =  function(){
    return _tracker;
  };


});