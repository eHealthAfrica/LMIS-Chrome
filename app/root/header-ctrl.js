'use strict';

angular.module('lmisChromeApp')
  .controller('HeaderCtrl', function($scope, $window, i18n, appConfigService, deviceInfoFactory, backgroundSyncService, analyticsSyncService) {
    $scope.states = {
      online: i18n('online'),
      offline: i18n('offline')
    };

    $scope.status = {
      label: deviceInfoFactory.isOnline() ? $scope.states.online : $scope.states.offline
    };

    var toggleOnline = function(event) {
      $window.addEventListener(event, function(e) {
        $scope.status = {
          label: $scope.states[e.type]
        };
        $scope.$digest();

        //this one sends when toggle from on to off and vice versa. I think we only need from off to on and on app start!
        analyticsSyncService.syncOfflineAnalytics().finally(function(){
          console.log('offline reports send to ga server.');
        });

        //trigger background syncing
        backgroundSyncService.startBackgroundSync()
          .finally(function() {
            console.log('updateAppConfigAndStartBackgroundSync  triggered on device connection ' +
              'status change has been completed.');
          });

      }, false);
    };

    for (var state in $scope.states) {
      toggleOnline(state);
    }
  });
