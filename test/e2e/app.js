'use strict';

describe('LMIS e2e tests', function() {
  it('should display the correct title', function() {
    browser.get('/');
    expect(browser.getTitle()).toEqual('Nigeria LMIS');
  });
});
