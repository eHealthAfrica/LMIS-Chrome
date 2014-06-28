'use strict';

describe('Factory: productCategoryFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate factory
  var productCategoryFactory, storageService;

  beforeEach(inject(function (_productCategoryFactory_, _storageService_) {
    productCategoryFactory = _productCategoryFactory_;
    storageService = _storageService_;
    spyOn(storageService, 'get').andCallThrough();
  }));

  it('i expect productCategoryFactory to be defined ', function () {
    expect(productCategoryFactory).toBeDefined();
  });

  it('i expect productCategoryFactory.get() to call storageService.get with the right parameters.', function () {
    expect(storageService.get).not.toHaveBeenCalled();
    var uuid = '1234-abe37-2182h';
    productCategoryFactory.get(uuid);
    expect(storageService.get).toHaveBeenCalledWith(storageService.PRODUCT_CATEGORY);
  });

  it('i expect productCategoryFactory.getAll() to call storageService.get with the right parameters.', function () {
    expect(storageService.get).not.toHaveBeenCalled();
    productCategoryFactory.getAll();
    expect(storageService.get).toHaveBeenCalledWith(storageService.PRODUCT_CATEGORY);
  });

});
