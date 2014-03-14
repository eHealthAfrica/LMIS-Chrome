'use strict';

angular.module('settingsMocks', [])
  .value('settingsMock', {
    facility: {},
    inventory: {
      serviceLevel: 90,
      products: {}
    }
  });
