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
        if(currentDate.getTime() > expirationDate.getTime()){
            return "danger_alert";
        }
        return '';
    };

    /*function monthDiff(dateOne, dateTwo) {
        var monthsInAYear = 12;
        return (dateTwo.getFullYear() - dateOne.getFullYear()) * monthsInAYear +
                    (dateTwo.getMonth() - dateOne.getMonth());
    };
    */

    /**
    * returns CSS class for expired expiration date, if the expiration date is in the past. uses system current time.
    *
    * @param {expirationDate}
    * @return {String} return promise object
    * @private
    */
    function  markAboutToExpire(expirationDate, monthsBeforeExpiration) {
        var currentDate = new Date();
        var expirationDateObj = new Date(expirationDate);
        var monthsInAYear = 12;
        var monthsDiff = Math.abs((currentDate.getFullYear() - expirationDateObj.getFullYear()) * monthsInAYear +
                            (currentDate.getMonth() - expirationDateObj.getMonth()));
        console.log("months diff: "+monthsDiff);

        if(currentDate.getTime() > expirationDate.getTime()){
            return "expired-product-item";
        }else if(monthsDiff >= monthsBeforeExpiration){
            return "about-to-expire";
        }
        return 'yet to expire';
    };

    return {
      getExpiredCSS: markExpired,
      getAboutToExpireCSS: markAboutToExpire,
    };

  });
