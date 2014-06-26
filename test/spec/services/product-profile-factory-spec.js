'use strict';

describe('Factory: productProfileFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'memoryStoreMocks'));

  // instantiate dependencies
  var productProfileFactory;
  var storageService;
  var productCategoryFactory;
  var $q;
  var memoryStorageService;
  var memoryStore;

  beforeEach(inject(function (_productProfileFactory_, cacheService, _storageService_, _productCategoryFactory_, _$q_, _memoryStorageService_, memoryStoreMock) {
    productProfileFactory = _productProfileFactory_;
    storageService = _storageService_;
    productCategoryFactory = _productCategoryFactory_;
    $q = _$q_;
    memoryStorageService = _memoryStorageService_;
    memoryStore = memoryStoreMock.memoryStore;

    spyOn(cacheService, 'get').andCallFake(function () {
      return memoryStoreMock.memoryStore
    });

    spyOn(memoryStorageService, 'get').andCallFake(function (dbName, key) {
      var db = memoryStore[dbName];
      var record = db[key];
      return record;
    });

    spyOn(memoryStorageService, 'getDatabase').andCallFake(function (dbName) {
      return memoryStore[dbName];
    });

    spyOn(storageService, 'all').andCallThrough();
    spyOn(productCategoryFactory, 'getKeyValuePairs').andCallThrough();
    spyOn($q, 'all').andCallThrough();

  }));

  it('i expect productProfileFactory to be defined ', function () {
    expect(productProfileFactory).toBeDefined();
  });

  it('i expect productProfileFactory.get() to call memoryStorageService.get() with the right parameters.', function () {
    expect(memoryStorageService.get).not.toHaveBeenCalled();
    var uuid = '075bd789-4b29-4033-80b6-4f834e602628';//BCG 20
    productProfileFactory.get(uuid);
    expect(memoryStorageService.get).toHaveBeenCalledWith(storageService.PRODUCT_PROFILE, uuid);
  });

  it('i expect productProfileFactory.get() to return product profile if record exist.', function () {
    var uuid = '075bd789-4b29-4033-80b6-4f834e602628';//BCG 20
    var result = productProfileFactory.get(uuid);
    var expectedResult = memoryStore[storageService.PRODUCT_PROFILE][uuid];
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResult);
  });

  it('i expect productProfileFactory.getAll() to call memoryStorageService.getDatabase() with the right parameter.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    productProfileFactory.getAll();
    expect(memoryStorageService.getDatabase).toHaveBeenCalledWith(storageService.PRODUCT_PROFILE);
  });

  it('i expect productProfileFactory.getAll() to return an array of product profile.', function () {
    var result = productProfileFactory.getAll();
    expect(angular.isArray(result)).toBeTruthy();
    expect(result.length).toBeGreaterThan(0)
  });

  it('i expect getAllGroupedByCategory() to return list of prod. profiles grouped by their category', function () {
    var result = productProfileFactory.getAllGroupedByCategory();
    var groupKeys = Object.keys(result);
    expect(groupKeys.length).toBeGreaterThan(2);//at least there is two category dry goods and cold store
    var coldStoreVaccineGrp = result['66e1bc4f-1dab-4842-80c5-49f626bde74e'];//cold store vaccine group
    expect(coldStoreVaccineGrp.category.name).toEqual('Cold Store Vaccines');
    expect(coldStoreVaccineGrp.productProfiles.length).toBeGreaterThan(0);
  });

  it('i expect getBatchGroupedByCategory(batch) to return only categories of product profiles in the given batch.', function () {
    var batch = [
      {
        "uuid": "075bd789-4b29-4033-80b6-4f834e602628",
        "created": "2014-01-30T11:13:53.058Z",
        "modified": "2014-01-30T11:13:53.144Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "BCG 20",
        "long_name": "BCG-20-DPV-ID-1.2Vol-Freeze-Dried-WHO-CSV",
        "product": "e55e1452-b0ab-4046-9d7e-3a98f1f968d0",
        "category": "66e1bc4f-1dab-4842-80c5-49f626bde74e",
        "presentation": "299939e1-94d7-4e8e-bfb7-c008af1692af",
        "formulation": "d2a1ae75-8fb0-4c80-80f7-0b05ba445b8a",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 1.2,
        "diluent_per_volume": 0.7,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      'f97be2aa-d5b6-4560-8f31-5a559fb80567',
      '14f512076fe8-73087d12-fbf0-4024-ea3a',
    ]; //BCG 10, Penta, ADS syringe //2 cold store vaccines and  1 dry store

    var result = productProfileFactory.getBatchGroupedByCategory(batch);
    var resultCategories = Object.keys(result);
    expect(resultCategories.length).toBe(2);//cold store va and dry goods.

    var coldStoreVaccineGrp = result['66e1bc4f-1dab-4842-80c5-49f626bde74e'];//cold store vaccine group
    expect(coldStoreVaccineGrp.productProfiles.length).toBe(2);

    var dryGoodsGrp = result['d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae'];
    expect(dryGoodsGrp.productProfiles.length).toBe(1);
  });

  it('i expect productProfileFactory.getBatch(batch) to return array of product profile of given batch, obj/uuid.', function () {
    var batch = [
      "d1a1d9958b1c-4f698a8d-5477-4f55-9811",
      {
        "uuid": "075bd789-4b29-4033-80b6-4f834e602628",
        "created": "2014-01-30T11:13:53.058Z",
        "modified": "2014-01-30T11:13:53.144Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "BCG 20",
        "long_name": "BCG-20-DPV-ID-1.2Vol-Freeze-Dried-WHO-CSV",
        "product": "e55e1452-b0ab-4046-9d7e-3a98f1f968d0",
        "category": "66e1bc4f-1dab-4842-80c5-49f626bde74e",
        "presentation": "299939e1-94d7-4e8e-bfb7-c008af1692af",
        "formulation": "d2a1ae75-8fb0-4c80-80f7-0b05ba445b8a",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 1.2,
        "diluent_per_volume": 0.7,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      }
    ];

    var result = productProfileFactory.getBatch(batch);
    expect(result.length).toBe(2);

  });

  it('i expect getByProductType(productType) to return array of product types of the given product type.', function () {
    var productType = 'e55e1452-b0ab-4046-9d7e-3a98f1f968d0';//BCG
    var result = productProfileFactory.getByProductType(productType);
    expect(result.length).toBeGreaterThan(0);
    for (var i in result) {
      var pp = result[i];
      expect(pp.product.code).toBe('BCG');
    }
  });

  it('i expect getByProductType(productType) to return EMPTY array if product type does not exist.', function () {
    var productType = 'e55e1452-b0ab-4046-9d7e';//invalid product type
    var result = productProfileFactory.getByProductType(productType);
    expect(result.length).toBe(0);
  });

  it('i expect getByProductType(productType) to return product profile if called with object product type.', function(){
    var productTypeObj = {
      uuid: 'e55e1452-b0ab-4046-9d7e-3a98f1f968d0',
      code: 'BCG'
    }
    var result = productProfileFactory.getByProductType(productTypeObj);
    expect(result.length).toBeGreaterThan(0);
    for (var i in result) {
      var pp = result[i];
      expect(pp.product.code).toBe('BCG');
    }
  });

});
