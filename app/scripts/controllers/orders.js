'use strict';

angular.module('lmisChromeApp')
  .controller('OrdersctrlCtrl', function($scope, storageService) {
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.showWeeks = true;
    $scope.toggleWeeks = function() {
      $scope.showWeeks = !$scope.showWeeks;
    };

    $scope.clear = function() {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function() {
      $scope.minDate = ($scope.minDate) ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      'year-format': '\'yy\'',
      'starting-day': 1
    };

    $scope.format = 'yyyy-MM-dd';

    //chrome.storage.local.clear();
    //populate order object with data if available in storage

    storageService.get('order_list').then(function(value) {
      $scope.load(value);
    });

    $scope.load = function(value) {
      if (value !== undefined) {

        var index = value.length - 1;
        $scope.orders = value[index];
        // jshint camelcase: false
        $scope.orders_index = index;
      } else {
        $scope.orders = {};
      }

    };

    //$scope.$watch('stored_data', function(){
    chrome.storage.local.get('order_list', function(storage) {
      $scope.$apply(function() {
        if (storage) {
          // jshint camelcase: false
          $scope.stored_data = storage;
        } else {
          $scope.stored_data = {};
        }
      });
    });

    // jshint camelcase: false
    $scope.data_storage = [];
    //save data when save button is clicked
    $scope.save = function() {
      //check for if we have data stored in local storage
      if ($scope.stored_data !== undefined) {
        $scope.data_storage = $scope.stored_data;
      }

      $scope.orders.synced = 0;
      $scope.orders.order_status = 0;
      // jshint camelcase: false
      $scope.orders.uuid = storageService.uuid;
      // jshint camelcase: false
      $scope.data_storage.push($scope.orders);
      chrome.storage.local.set({
        // jshint camelcase: false
        'order_list': $scope.data_storage
      });
    };
  })

  .controller('OrdersListCtrl', function($scope, storageService, $filter, ngTableParams) {
    storageService.get(storageService.ORDERS).then(function(data) {
      // Table defaults
      var params = {
        page: 1,
        count: 10,
        sorting: {
          name: 'asc'
        }
      };

      // Pagination
      var resolver = {
        total: data.length,
        getData: function($defer, params) {
          var filtered, sorted = data;
          if (params.filter()) {
            filtered = $filter('filter')(data, params.filter());
          }
          if (params.sorting()) {
            sorted = $filter('orderBy')(filtered, params.orderBy());
          }
          params.total(sorted.length);
          $defer.resolve(sorted.slice(
            (params.page() - 1) * params.count(),
            params.page() * params.count()
          ));
        }
      };

      // jshint newcap: false
      $scope.salesList = new ngTableParams(params, resolver);
    });
  })

  .controller('SalesOrderForm', function($scope, storageService) {
    storageService.get(storageService.FACILITY).then(function(data) {
      $scope.facilities = data;
    });
  })

  .config(function($stateProvider) {
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
        currentFacility: function(facilityFactory){
          return facilityFactory.getCurrentFacility();
        },
        uomList: function(storageService) {
          return storageService.get(storageService.UOM);
        },
        productTypes: function(storageService) {
          return storageService.get(storageService.PRODUCT_TYPES);
        },
        uuid: function(storageService) {
          return storageService.uuid;
        },
        facilities: function(storageService) {
          return storageService.get(storageService.FACILITY);
        },
        loggedInUser: function(userFactory) {
          return userFactory.getLoggedInUser();
        },
        programs: function(storageService) {
          return storageService.get(storageService.PROGRAM);
        },
      },
      controller: function($scope, $filter, currentFacility, uomList, productTypes, facilities, loggedInUser, programs,
                           $stateParams) {

        $scope.storage = {
          uomList: uomList,
          productTypes: productTypes,
          receiving_facility: currentFacility,
          facilities: facilities,
          programs: programs
        };

        function setOrderNo(){
          var timeStamp = String(new Date().getTime());
          return $scope.storage.receiving_facility.code+'-'+loggedInUser.id+'-'+
              timeStamp.substring(timeStamp.length -5, timeStamp.length);
        }

        $scope.order = {
          order_lines: [],
          date: $filter('date')(new Date(), 'yyyy-MM-dd'),
          order_no: setOrderNo(),
          placed_by: loggedInUser.id,
          program: $stateParams.program
        };

        var id = 1;

        $scope.addOrderLine = function() {
          $scope.order.order_lines.push({id: id++});
        };

        $scope.removeOrderLine = function(orderLine) {
          $scope.order.order_lines = $scope.order.order_lines.filter(function(line) {
            return line.id !== orderLine.id;
          });
        };

        $scope.save = function(){
          $scope.order['receiving_facility'] = $scope.storage.receiving_facility.uuid;
          console.log($scope.order);
        }

      }
    });
  });
