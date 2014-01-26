/**
 *  This service is used to mark or highlight table rows of product items that have expired
 *  or will expire soon.
 */

'use strict';

angular.module('lmisChromeApp')
  .factory('visualMarkerService', function ($q, $rootScope) {

    /**
    * returns CSS class for expired expiration date, if the expiration date is in the past. uses system current time.
    *
    * @param {expirationDate}
    * @return {String} return promise object
    * @private
    */
    function  markExpired(expirationDate) {
        var currentDate = new Date();
        var expirationDate = new Date(expirationDate);
        if(currentDate.getTime() < expirationDate.getTime()){
            return "expired-product-item";
        }
        return '';
    }

    return {
      getExpiredCSS: markExpired,
    };

  });
