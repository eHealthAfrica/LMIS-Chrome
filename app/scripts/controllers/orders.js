'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('orders', {
    abstract: true,
    templateUrl: 'views/orders/index.html'
  })
      .state('orders.place', {
        url: '/orders/place?program',
        templateUrl: 'views/orders/place-order.html',
        data: {
          label: 'Place order'
        },
        resolve: {
          appConfig: function (facilityFactory) {
            return facilityFactory.getCurrentFacility();
          },
          uomList: function (storageService) {
            return storageService.get(storageService.UOM);
          },
          productTypes: function (storageService) {
            return storageService.get(storageService.PRODUCT_TYPES);
          },
          uuid: function (storageService) {
            return storageService.uuid;
          },
          facilities: function (storageService) {
            return storageService.get(storageService.FACILITY);
          },
          loggedInUser: function (userFactory) {
            return userFactory.getLoggedInUser();
          },
          programs: function (storageService) {
            return storageService.get(storageService.PROGRAM);
          },
        },
        controller: function ($scope, $filter, currentFacility, uomList, productTypes, facilities, loggedInUser, programs, $stateParams, $state, ordersFactory) {

          $scope.storage = {
            uomList: uomList,
            productTypes: productTypes,
            receiving_facility: currentFacility,
            facilities: facilities,
            programs: programs
          };

          function setOrderNo() {
            var timeStamp = String(new Date().getTime());
            return $scope.storage.receiving_facility.code + '-' + loggedInUser.id + '-' +
                timeStamp.substring(timeStamp.length - 5, timeStamp.length);
          }

          $scope.order = {
            order_lines: [],
            date: $filter('date')(new Date(), 'yyyy-MM-dd'),
            order_no: setOrderNo(),
            placed_by: loggedInUser.id,
            program: $stateParams.program
          };

          var id = 1;

          $scope.addOrderLine = function () {
            $scope.order.order_lines.push({id: id++});
          };

          $scope.removeOrderLine = function (orderLine) {
            $scope.order.order_lines = $scope.order.order_lines.filter(function (line) {
              return line.id !== orderLine.id;
            });
          };

          $scope.save = function () {
            $scope.order['receiving_facility'] = $scope.storage.receiving_facility.uuid;
            ordersFactory.save($scope.order).then(function (result) {
              if (result !== undefined) {
                $state.go('home.index.mainActivity', {orderNo: $scope.order.order_no});
              }
            });
          }

        }
      });
});
