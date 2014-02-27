'use strict';

angular.module('lmisChromeApp')
    .factory('storageUnitFactory', function ($q, $rootScope, storageService) {

      function getByUUID(uuid) {

      }

      // Public API here
      return {

        getAll: function () {

        },

        get: getByUUID
      };

    });

