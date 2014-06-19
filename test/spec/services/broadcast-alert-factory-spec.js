'use strict';

describe('BroadcastAlert Factory', function () {

  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var storageService, broadcastAlertFactory, $q, syncService, notificationService, uuid, ccuBcAlertWithUuid, ccuBcAlertNoUuid, bcAlertList;

  beforeEach(inject(function(_broadcastAlertFactory_, _storageService_, _$q_, _syncService_, _notificationService_) {
    broadcastAlertFactory = _broadcastAlertFactory_;
    storageService = _storageService_;
    $q = _$q_;
    syncService = _syncService_;
    notificationService =_notificationService_;

    uuid = '1234';
    ccuBcAlertWithUuid = {
      uuid: '1234',
      type: broadcastAlertFactory.types.CCU_BREAKDOWN,
      ccuProfile: {
        dhis2_modelid: 18701
      },
      created: new Date(),
      facility: {
        uuid: '134213'
      }
    };

    ccuBcAlertNoUuid = {
      type: broadcastAlertFactory.types.CCU_BREAKDOWN,
      ccuProfile: {
        dhis2_modelid: 18701
      },
      created: new Date(),
      facility: {
        uuid: '134213'
      }
    };

    bcAlertList = [
      {
        uuid: '1234',
        type: broadcastAlertFactory.types.CCU_BREAKDOWN,
        dhis2_modelid: 18701,
        created: new Date(),
        facility: '134213'
      },
      {
        uuid: '1235',
        type: broadcastAlertFactory.types.STOCK_OUT,
        productType: '1234561',
        stockLevel: 345,
        created: new Date(),
        facility: '134213'
      },
      {
        uuid: '12367',
        type: broadcastAlertFactory.types.LOW_STOCK,
        productType: '1234561',
        stockLevel: 345,
        created: new Date(),
        facility: '134213'
      }
    ];

  }));

  it('i expect broadcastAlertFactory to be defined.', function(){
    expect(broadcastAlertFactory).toBeDefined();
  });

  it('i expect storageService to be defined.', function(){
    expect(storageService).toBeDefined();
  });

  it('i expect broadcastAlertFactory.types to have 3 types', function(){
    var types = Object.keys(broadcastAlertFactory.types);
    expect(types.length).toBe(3);
  });

  it('i expect broadcastAlertFactory.save() to call storageService.save() with correct parameters.', function(){
    spyOn(storageService, 'save').andCallThrough();
    expect(storageService.save).not.toHaveBeenCalled();
    broadcastAlertFactory.save(ccuBcAlertWithUuid);
    expect(storageService.save).toHaveBeenCalledWith(storageService.BROADCAST_ALERT, ccuBcAlertWithUuid);
  });

  it('i expect broadcastAlertFactory.save() to return object with uuid when called with object without uuid.', function(){
    spyOn(storageService, 'save').andCallFake(function(){
      var dfd = $q.defer();
      dfd.resolve(uuid);
      return dfd.promise;
    });

    expect(ccuBcAlertNoUuid.uuid).toBeUndefined();
    runs(
      function () {
        return broadcastAlertFactory.save(ccuBcAlertNoUuid);
      },
      function checkExpectations(result) {
        var expectedResult = ccuBcAlertNoUuid;
        expectedResult.uuid = uuid;
        expect(result).toBe(expectedResult);
      }
    );

  });

  it('i expect broadcastAlertFactory.get(uuid) to call storageService.find() with correct parameters.', function(){
    spyOn(storageService, 'find').andCallThrough();
    expect(storageService.find).not.toHaveBeenCalled();
    broadcastAlertFactory.get(uuid);
    expect(storageService.find).toHaveBeenCalledWith(storageService.BROADCAST_ALERT, uuid);
  });

  it('i expect broadcastAlertFactory.getAll() to call storageService.all() with correct parameter.', function(){
    spyOn(storageService, 'all').andCallThrough();
    expect(storageService.all).not.toHaveBeenCalled();
    broadcastAlertFactory.getAll();
    expect(storageService.all).toHaveBeenCalledWith(storageService.BROADCAST_ALERT);
  });

  it('i expect broadcastAlertFactory.getAllByType(type) to return list of alerts that are of the given type.', function(){
    var dfd = $q.defer();
    spyOn(storageService, 'all').andCallFake(function(){
      dfd.resolve(bcAlertList);
      return dfd.promise;
    });
    runs(
      function () {
        return broadcastAlertFactory.getAllByType(broadcastAlertFactory.types.STOCK_OUT);
      },
      function checkExpectations(result) {
        expect(bcAlertList.length).toBeGreaterThan(1);
        expect(result.length).toBe(1);
        var bcAlert = result[0];
        expect(bcAlert.type).toBe(broadcastAlertFactory.types.STOCK_OUT);
      }
    );

  });

  it('i expect broadcastAlertFactory.getMessage() to return STOCK OUT message object.', function(){
    var bcStockOutAlert = {
      uuid: uuid,
      facility: {
        uuid: '123-271'
      },
      productType: {
        uuid: '0912-122'
      },
      stockLevel: 123,
      created: new Date(),
      type: broadcastAlertFactory.types.STOCK_OUT
    };
    var expectedResult = {
      uuid: bcStockOutAlert.uuid,
      facility: bcStockOutAlert.facility.uuid,
      productType: bcStockOutAlert.productType.uuid,
      stockLevel: bcStockOutAlert.stockLevel,
      created: bcStockOutAlert.created,
      type: bcStockOutAlert.type
    };
    var result = broadcastAlertFactory.getMessage(bcStockOutAlert);
    expect(result).toEqual(expectedResult);

  });

  it('i expect broadcastAlertFactory.getMessage() to return LOW_STOCK message object.', function(){
    var bcStockOutAlert = {
      uuid: uuid,
      facility: {
        uuid: '123-271'
      },
      productType: {
        uuid: '0912-122'
      },
      stockLevel: 123,
      created: new Date(),
      type: broadcastAlertFactory.types.LOW_STOCK
    };
    var expectedResult = {
      uuid: bcStockOutAlert.uuid,
      facility: bcStockOutAlert.facility.uuid,
      productType: bcStockOutAlert.productType.uuid,
      stockLevel: bcStockOutAlert.stockLevel,
      created: bcStockOutAlert.created,
      type: bcStockOutAlert.type
    };
    var result = broadcastAlertFactory.getMessage(bcStockOutAlert);
    expect(result).toEqual(expectedResult);

  });

    it('i expect broadcastAlertFactory.getMessage() to return CCU_BREAKDOWN message object.', function(){
    var expectedResult = {
      uuid: ccuBcAlertWithUuid.uuid,
      facility: ccuBcAlertWithUuid.facility.uuid,
      dhis2_modelid: ccuBcAlertWithUuid.ccuProfile.dhis2_modelid,
      created: ccuBcAlertWithUuid.created,
      type: ccuBcAlertWithUuid.type
    };
    var result = broadcastAlertFactory.getMessage(ccuBcAlertWithUuid);
    expect(result).toEqual(expectedResult);

  });

  it('i expect broadcastAlertFactory.sendAlert(bcAlert) to call syncService.syncItem() with correct parameters.', function(){
    spyOn(syncService, 'syncItem').andCallThrough();
    expect(syncService.syncItem).not.toHaveBeenCalled();
    broadcastAlertFactory.sendAlert(ccuBcAlertWithUuid);
    var allowMultipleSync = true;
    expect(syncService.syncItem).toHaveBeenCalledWith(storageService.BROADCAST_ALERT, ccuBcAlertWithUuid, allowMultipleSync);
  });

});
