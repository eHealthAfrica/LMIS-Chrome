'use strict';

describe('Service: utilizationFormFields', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var utilizationFormFields;
  beforeEach(inject(function (_utilizationFormFields_) {
    utilizationFormFields = _utilizationFormFields_;
  }));

  it('should return an array', function () {
    expect(Object.prototype.toString.call(utilizationFormFields)).toEqual('[object Array]');
  });

});
