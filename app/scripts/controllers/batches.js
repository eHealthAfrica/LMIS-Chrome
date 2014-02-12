'use strict';

angular.module('lmisChromeApp')
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
    .controller('BatchListCtrl', function ($scope, storageService, visualMarkerService, utility, $filter, ngTableParams) {
      $scope.highlight = visualMarkerService.markByExpirationStatus;

      storageService.all(storageService.BATCH).then(function (data) {
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
          getData: function ($defer, params) {
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            $defer.resolve(orderedData.slice(
                (params.page() - 1) * params.count(),
                params.page() * params.count()
            ));
          }
        }

        $scope.productItemList = new ngTableParams(params, resolver);
      });

      storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
        $scope.products = data;
      });

      storageService.get(storageService.COMPANY).then(function (data) {
        $scope.companies = data;
      });

      storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
        $scope.presentations = data;
      });

      storageService.get(storageService.PRODUCT_FORMULATION).then(function (data) {
        $scope.productFormulation = data;
      });

      storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function (modesOfAdmin) {
        $scope.modesOfAdmin = modesOfAdmin;
      });

      storageService.get(storageService.UOM).then(function (uomList) {
        $scope.uomList = uomList;
      });

      storageService.get(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
      });

    });