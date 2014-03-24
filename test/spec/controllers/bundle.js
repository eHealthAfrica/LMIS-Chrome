'use strict';

xdescribe('Inventory controller', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  var $state;
  beforeEach(inject(function(_$state_) {
    $state = _$state_;
  }));

  it('as a user, i want to log incoming bundle url to be "incoming-log"', function() {
    var state = $state.get('incomingLog');
    expect($state.href(state)).toEqual('#/incoming-log');
    expect($state.href(state)).not.toEqual('#/log-incoming-test');
  });
});
