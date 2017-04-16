/**
 * Created by ehealthafrica on 5/21/15.
 */

angular.module('lmisChromeApp')
  .service('kcContactService', function($http){

    this.getFacility= function(lgaName, pos){

      var lga = lgaName || 'Ajingi';
      var url = '', field = [], prop = [];

      url = KCFACILITYURL + '?lganame='+query;
      if(pos){
        url += '&position='+ pos;
      }
      // Authorization
      $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
      $cookieStore.put('basicToken', token);

      return $http.get(url)
        .then(function(response){
          var r= [];
          response.data.features.forEach(function(item){
            r.push(item);
          });

          return _pluck(r);
        });
    };
    function _pluck(response){
      var r = [];
      response.sort(function(a,b){
        if (a.properties['primary_name'] > b.properties['primary_name']) {
          return 1;
        }
        if (a.properties['primary_name'] < b.properties['primary_name']) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      return response;
    }
  });