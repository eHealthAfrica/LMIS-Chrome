'use strict';

describe('Service: pouchMigrationService', function() {

  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var pouchMigrationService;
  beforeEach(inject(function(_pouchMigrationService_) {
    pouchMigrationService = _pouchMigrationService_;
  }));

  it('should expose a migrate function', function() {
    expect(angular.isDefined(pouchMigrationService.migrate)).toBe(true);
  });

});
