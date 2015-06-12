'use strict';

describe('Service: utilizationService', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var utility, storageService, $q, syncService, utilizationService;

  beforeEach(inject(function (_utility_, _storageService_, _syncService_, _$q_, _utilizationService_) {
    utility = _utility_;
    storageService = _storageService_;
    syncService = _syncService_;
    $q = _$q_;
    utilizationService = _utilizationService_;

  }));

  describe('filterAntigens', function() {
    var selectedProducts = {
      '0': {
        name: 'OPV',
        category: {
          name: 'Cold Store Vaccines'
        }
      },
      '1': {
        name: 'BCG',
        category: {
          name: 'Cold Store Vaccines'
        }
      },
      '2': {
        name: 'Syringe',
        category: {
          name: 'Dry Store Syringes'
        }
      }
    };

    it('should return on products with "Cold Store Vaccines" category', function() {
      var result = utilizationService.filterAntigens(selectedProducts);
      expect(Object.keys(result).length).toEqual(2);
    });

  });

});
