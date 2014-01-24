'use strict';

angular.module('lmisChromeApp')
  .controller('FacilitiesCtrl', function ($scope, storageService, utility) {

    storageService.get('facility').then(function(data){

         $scope.facilities = data;
    });

   $scope.getUser = function(created_by){
       return created_by.username;
   }

  utility.loadTableObject('facility_type').then(function(data){
      $scope.facility_types = data;
  });


  });
