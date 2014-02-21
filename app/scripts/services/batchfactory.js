'use strict';

angular.module('lmisChromeApp')
    .factory('batchFactory', function () {

      /**
       * Expose Public API
       */
      return {
        /**
         * This returns complete
         * @param object
         * @returns {program} - JSON Object
         */
        getAll: function (obj) {
          return obj.program;
        }
      };
    });
