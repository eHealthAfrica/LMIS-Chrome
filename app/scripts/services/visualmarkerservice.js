'use strict';

/**
 * This service is used to mark or highlight table rows of product items that
 * have expired or will expire soon.
 */
angular.module('lmisChromeApp')
  .factory('visualMarkerService', function() {

    /**
     * Returns CSS class for expired expiration date, if the expiration date is
     * in the past. uses system current time.
     *
     * @param {String} expirationDate
     * @param {Int} monthsBeforeExpiration
     * @return {String} css class
     * @private
     */
    function getCCEByExpirationDate(expirationDate, monthsBeforeExpiration) {
      var currentDate = new Date();
      var expirationDateObj = new Date(expirationDate);
      var monthsInAYear = 12;
      var monthsDiff = Math.abs((currentDate.getFullYear() - expirationDateObj.getFullYear()) * monthsInAYear + (currentDate.getMonth() - expirationDateObj.getMonth()));

      if (currentDate.getTime() > expirationDateObj.getTime()) {
        return 'danger-alert';
      } else if (parseInt(monthsBeforeExpiration) <= monthsDiff) {
        console.log(monthsDiff);
        return 'warning-alert';
      }

      return '';
    }

    return {
      markByExpirationStatus: getCCEByExpirationDate
    };

  });
