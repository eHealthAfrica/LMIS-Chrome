'use strict';

angular.module('lmisChromeApp')
  .factory('programsFactory', function () {
    // Service logic
    // ...



    // Public API here
    return {
      /**
       * This function returns program attribute of any given object. This is used since AngularJS does allow processing
       * of nested JSON object inside the template.
       *
       * @param object
       * @returns {program} - JSON Object
       */
      getProgram: function (uuid) {
        //TODO: complete implementation
        return uuid;
      }
    };
  });
