'use strict';

describe('i18n service', function() {
  beforeEach(module('lmisChromeApp', 'i18nMockedWindow'));

  var i18n;
  beforeEach(inject(function(_i18n_) {
    i18n = _i18n_;
  }));

  it('should alias Chrome i18n#getMessage', function() {
    expect(angular.isFunction(i18n)).toBe(true);
  });
});
