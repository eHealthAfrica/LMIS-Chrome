'use strict';

describe('storageService', function () {

  var deferred;
  var storageService;
  var pouchStorageService;
  var rootScope;
  var resolvedValue;
  var record;
  var $q;
  var $window;

  beforeEach(module('lmisChromeApp', 'i18nMocks', 'fixtureLoaderMocks', 'idbServiceMocks'));

    // Initialize the state
  beforeEach(inject(function($templateCache, fixtureLoaderMock) {
    // Mock each template used by the state
    var templates = [
      'index/index',
      'index/header',
      'index/breadcrumbs',
      'index/footer',
      'home/index',
      'home/nav',
      'home/sidebar',
      'home/control-panel',
      'home/main-activity',
      'home/home',
      'dashboard/dashboard',
      'index/loading-fixture-screen',
      'index/migration-screen'
    ];

    angular.forEach(templates, function(template) {
      $templateCache.put('views/' + template + '.html', '');
    });

    fixtureLoaderMock.loadFixtures();

  }));

  beforeEach(inject(function (_storageService_, _$q_, _$rootScope_, _pouchStorageService_, _idbMock_) {
    storageService = _storageService_;
    deferred = _$q_.defer();
    rootScope = _$rootScope_;
    pouchStorageService = _pouchStorageService_;
    record = { uuid: '1234-67615-901817', modified: new Date(), dateSynced: new Date() };
    $q = _$q_;
    $window = _idbMock_;
  }));

  it('should be able to add new table to the pouch storage', function(){
    spyOn(pouchStorageService, 'put').andReturn(deferred.promise);
    storageService.add('table', {uuid: 'value'});
    //FIXME: this doesnt if value was stored in table // set is called outside storageService add function scope;
    //expect(pouchStorageService.put).toHaveBeenCalled();
  });

  it('should be able to get data from the table in the pouch storage', function(){
    spyOn(pouchStorageService, 'allDocs').andReturn(deferred.promise);
    storageService.get('key');
    expect(pouchStorageService.allDocs).toHaveBeenCalled();
  });


  it('should be able to resolve promise when getting data from the table', function(){
    deferred.resolve('resolvedData');
    spyOn(pouchStorageService, 'get').andReturn(deferred.promise);
    storageService.get('key').then(function(value){
      resolvedValue = value;
    });
    //FIXME: this doesnt test if what storageService returns rootScope.$apply();
    //expect(resolvedValue).toEqual('resolvedData');
  });

  it('should be able to resolve promise when getting all data from the pouch storage', function(){
    deferred.resolve('resolvedData');
    spyOn(pouchStorageService, 'allDocs').andReturn(deferred.promise);
    storageService.all().then(function(value){
      resolvedValue = value;
    });
    //FIXME: this doesnt test if what storageService returns rootScope.$apply();
    //expect(resolvedValue).toEqual('resolvedData');
  });

  it('should be able to remove table from the pouch storage', function(){
    spyOn(pouchStorageService, 'destroy').andReturn(deferred.promise);
    storageService.remove();
    expect(pouchStorageService.destroy).toHaveBeenCalled();
  });

  xit('should be able to resolve promise when removing table from the pouch storage', function(){
    deferred.resolve('resolved');
    spyOn(pouchStorageService, 'remove').andReturn(deferred.promise);
    storageService.remove().then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolved');
  });

  it('should be able to clear all data from the pouch storage', function(){
    spyOn(pouchStorageService, 'destroy').andReturn(deferred.promise);
    storageService.clear();
    expect(pouchStorageService.destroy).toHaveBeenCalled();
  });

  xit('should be able to resolve promise when clearing all data from the pouch storage', function(){
    deferred.resolve('resolved');
    spyOn(pouchStorageService, 'remove').andReturn(deferred.promise);
    storageService.clear().then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolved');
  });

  it('should be able to generate uuid with 36 unique symbols length', function () {
    var uuid = storageService.uuid();
    expect(uuid.length).toBe(36);
  });

  it('should be able to return an array or collection of rows in the given table and return promise', function () {
    spyOn(pouchStorageService, 'allDocs').andReturn(deferred.promise);
    storageService.all('test');
    expect(pouchStorageService.allDocs).toHaveBeenCalled();
  });

  it('should be able to insert new database table row and return promise only if there is no row', function () {
    spyOn(pouchStorageService, 'put').andReturn(deferred.promise);
    storageService.insert('test', {username: 'lomis'});
    //FIXME: this doesnt if value was stored in table // set is called outside storageService add function scope;
    //expect(pouchStorageService.set).toHaveBeenCalled();s
  });

  it('should be able to update database table row and return promise', function () {
    spyOn(pouchStorageService, 'put').andReturn(deferred.promise);
    storageService.update('test', {uuid: 'value'});
    //FIXME: this doesnt if value was stored in table // set is called outside storageService add function scope;
    //expect(pouchStorageService.set).toHaveBeenCalled();
  });

  it('should find a doc by a given key', function () {
    spyOn(pouchStorageService, 'get').andReturn(deferred.promise);
    storageService.find('test', 'key');
    expect(pouchStorageService.get).toHaveBeenCalled();
  });


  it('should be able to insert batch data into a table and return promise', function () {
    spyOn(pouchStorageService, 'bulkDocs').andReturn(deferred.promise);
    storageService.insertBatch('test', ['key1', 'key2', 'key3']);
    expect(pouchStorageService.bulkDocs).toHaveBeenCalled();
  });

  it('i expect insertBatch to throw an exception', function(){
    expect(function(){ storageService.insertBatch('test', 'non-array'); }).toThrow();
  });

  it('i expect updateData NOT to update record dateModified if called with updateDateModified set to false', function(){
    var updateDateModified = false;
    var modifiedDate = record.modified;
    expect(modifiedDate).toBe(record.modified);
    storageService.update('test', record, updateDateModified);
    expect(modifiedDate).toBe(record.modified);//should be same after calling update
  });

  it('i expect updateData TO UPDATE record dateModified if called with updateDateModified set to true', function(){
    var modifiedDate = record.modified;
    var updateDateModified = true;
    expect(modifiedDate).toBe(record.modified);//should be same before calling update
    storageService.update('test', record, updateDateModified);
    expect(modifiedDate).not.toBe(record.modified);
  });

  it('i expect updateData TO UPDATE record dateModified if called WITHOUT updateDateModified.', function(){
    var modifiedDate = record.modified;
    expect(modifiedDate).toBe(record.modified);//should be same before calling update
    storageService.update('test', record);
    expect(modifiedDate).not.toBe(record.modified);
  });

  it('i expect update to throw exception when called with data that has no UUID or Primary Key field.', function(){
    var recordWithoutPkField = { name: 'test-user', age: 19};
    expect(function(){ storageService.update('test', recordWithoutPkField); }).toThrow();
  });

  it('i expect insert new db row to throw exception when called with record that HAS uuid or PK field', function () {
    expect(function(){  storageService.insert('test', {uuid: 'lomis'}); }).toThrow();
  });

  it('i expect add record to throw exception when called with that that has no uuid', function(){
    expect(function(){  storageService.add('test', {nouuid: 'lomis'}); }).toThrow();
  });

  it('i expect removeRecord to call pouch.get', function(){
    var dbName = 'test';
    spyOn(pouchStorageService, 'get').andCallThrough();
    storageService.removeRecord(dbName, '1');
    expect(pouchStorageService.get).toHaveBeenCalledWith(dbName, '1');
    //FIXME: test also that pouch.set is called after deleting record
  });

});
