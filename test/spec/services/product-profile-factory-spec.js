'use strict';

describe('Factory: productProfileFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate factory
  var productProfileFactory, storageService, productCategoryFactory, $q;

  beforeEach(inject(function (_productProfileFactory_, _storageService_, _productCategoryFactory_, _$q_) {
    productProfileFactory = _productProfileFactory_;
    storageService = _storageService_;
    productCategoryFactory = _productCategoryFactory_;
    $q = _$q_;

    spyOn(storageService, 'find').andCallThrough();
    spyOn(storageService, 'all').andCallThrough();
    spyOn(productCategoryFactory, 'getKeyValuePairs').andCallThrough();
    spyOn($q, 'all').andCallThrough();

  }));

  it('i expect productProfileFactory to be defined ', function () {
    expect(productProfileFactory).toBeDefined();
  });

  it('i expect productProfileFactory.get() to call storageService.find with the right parameters.', function () {
    expect(storageService.find).not.toHaveBeenCalled();
    var uuid = '1234-abe37-2182h';
    productProfileFactory.get(uuid);
    expect(storageService.find).toHaveBeenCalledWith(storageService.PRODUCT_PROFILE, uuid);
  });

  it('i expect productProfileFactory.getAll() to call storageService.all with the right parameter.', function () {
    expect(storageService.all).not.toHaveBeenCalled();
    productProfileFactory.getAll();
    expect(storageService.all).toHaveBeenCalledWith(storageService.PRODUCT_PROFILE);
  });

  it('i expect getAllGroupedByCategory() to call $q.all(), storageServe.all and prod-category-factory.getKeyValuePairs',
    function(){
      expect(storageService.all).not.toHaveBeenCalled();
      expect($q.all).not.toHaveBeenCalled();
      expect(productCategoryFactory.getKeyValuePairs).not.toHaveBeenCalled();
      productProfileFactory.getAllGroupedByCategory();

      expect(storageService.all).toHaveBeenCalledWith(storageService.PRODUCT_PROFILE);
      expect(productCategoryFactory.getKeyValuePairs).toHaveBeenCalled();
      expect($q.all).toHaveBeenCalled();
    }
  );

});
