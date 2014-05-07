'use strict';

angular.module('lmisChromeAppMocks', [])
  .value('$window', {
    'showSplashScreen': function(){},
    'hideSplashScreen': function(){}
  });