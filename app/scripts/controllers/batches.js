'use strict';

angular.module('lmisChromeApp')
/**
 * configure routes for batch module
 */
    .config(function ($stateProvider) {
      $stateProvider
          .state('batchListView', {
            url: '/batch-list-view',
            templateUrl: '/views/batches/index.html',
            controller: 'BatchListCtrl'
          });
    })
/**
 * AddProductItemCtrl - This handles the addition of product items
 */
    .controller('AddProductItemCtrl', function ($scope, storageService, $location) {
      $scope.productItem = {};
      $scope.productItem.active = true; //default is true

      storageService.get(storageService.PRODUCT_TYPES).then(function (productList) {
        $scope.products = productList;
      });

      storageService.get(storageService.PRODUCT_PRESENTATION).then(function (presentationList) {
        $scope.presentations = presentationList;
      });

      storageService.get(storageService.COMPANY).then(function (companyList) {
        $scope.companies = companyList;
      });

      storageService.get(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
      });

      storageService.get(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
      });

      storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function (modeOfAdministrationList) {
        $scope.modes = modeOfAdministrationList;
      });

      storageService.get(storageService.PRODUCT_FORMULATION).then(function (formulationList) {
        $scope.formulations = formulationList;
      });

      storageService.get(storageService.UOM).then(function (uomList) {
        $scope.uomList = uomList;
      });

      storageService.get(storageService.PRODUCT_PROFILE).then(function (data) {
        $scope.profileList = data;
      });

      $scope.onProfileSelection = function () {
        console.log("new profile selected ==> " + $scope.productItem.profile);
      };

      /**
       * This function, 'save', when triggered saves the product item form data to
       * local storage.
       */
      $scope.save = function () {
        storageService.insert(storageService.BATCH, $scope.productItem).then(function () {
          $location.path('/batches/');
        });
      };
    })


/**
 * BatchListCtrl - This handles the display of Product-Items pulled from
 * storage.
 */
    .controller('BatchListCtrl', function ($scope, storageService, batchFactory, visualMarkerService, $filter, ngTableParams) {

      $scope.highlight = visualMarkerService.highlightByExpirationStatus;

      batchFactory.getAll().then(function(data){


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
          getData: function ($defer, params) {
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
        }

       $scope.batches = new ngTableParams(params, resolver);

      });

    });