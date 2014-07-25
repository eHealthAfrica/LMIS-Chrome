'use strict';

angular.module('lmisChromeApp')
  .config(function($provide) {
    $provide.decorator('$exceptionHandler', function($delegate, $injector) {
      var trackingFactory;
      return function(exception, cause) {
        $delegate(exception, cause);
        trackingFactory = trackingFactory || $injector.get('trackingFactory');
        trackingFactory.postException(exception.message, false);
      };
    });
  });
