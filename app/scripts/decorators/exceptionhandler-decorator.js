'use strict';

angular.module('lmisChromeApp')
  .config(function($provide) {
    $provide.decorator('$exceptionHandler', function($delegate, $injector) {
      var trackingService;
      return function(exception, cause) {
        $delegate(exception, cause);
        trackingService = trackingService || $injector.get('trackingService');
        trackingService.postException(exception.message, false);
      };
    });
  });
