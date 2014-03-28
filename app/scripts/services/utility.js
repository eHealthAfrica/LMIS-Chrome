'use strict'

angular.module('lmisChromeApp').service('utility', function ($q, storageService) {

  /**
   * This spaces out string concatenated by -
   * @param name - string to be re-formatted
   * @returns {XML|string}
   */
  this.getReadableProfileName = function(name){
    return name.replace(/\-/g,' - ').replace(/([0-9])([a-zA-Z])/g,'$1 $2').replace(/([a-z][a-z])([A-Z])/g,'$1 $2');
  }

  /**
   * this returns the local time-zone difference from GMT.
   */
  this.getTimeZone = function () {
    //TODO: this needs to be a global function with better timezone calculation
    //TODO: ref https://bitbucket.org/pellepim/jstimezonedetect
    var tz = new Date().getTimezoneOffset() / 60;
    return (tz < 0) ? parseInt('+' + Math.abs(tz)) : parseInt('-' + Math.abs(tz));
  }
});