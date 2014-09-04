angular.module('lmisChromeApp')
    .service('expiredProductAlertService', function(){

      this.compareDates = function(productDate){
        console.log(new Date(arguments[1]) +'--'+ productDate);
        //if second argument is supplied, use to compare, else use new Date()
        var compareDate = (Object.prototype.toString.call(arguments[1]) === '[object Date]') ? new Date(arguments[1]) : new Date();

        if(new Date(productDate) < compareDate){
          return true;
        }
        return false;
      }
  })