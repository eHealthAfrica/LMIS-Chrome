angular.module('lmisChromeApp')
  .directive('lmisAnalyticsDirective', ['trackingService', function(trackingService) {
    return {
        restrict: 'AE',
        link:function(scope, element, attr) {

       var tracker = trackingService.getTracker();

        element.on('click', function(event){
            tracker.sendEvent('Click', element.text(), attr.lmisPageViewReport);
        });
        
    }
    };
  }])
  .directive('lmisPageViewReport', ['trackingService', function(trackingService) {
    return function(scope, element, attr) {
        
        var tracker = trackingService.getTracker();
        tracker.sendAppView(attr.lmisPageViewReport);

    };
  }])
;