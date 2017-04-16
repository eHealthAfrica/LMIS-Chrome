'use strict';

angular.module('lmisChromeApp').service('notificationService', function($modal, $q, i18n, $window, utility) {

  var noSmsSupportMsg = 'SMS support not available!';
  this.NO_SMS_SUPPORT = noSmsSupportMsg;
  this.alertRecipient = '08176671738';//FIXME: pull this from local or remote db later, dont hardcode.
  this.countryCode = '+234';

  this.vibrate = function(duration) {
    if (navigator.notification) {
      navigator.notification.vibrate(duration);
    }
  };

  this.beep = function(repeat) {
    if (navigator.notification) {
      //navigator.notification.beep(repeat);
    }
  };

  /**
   *
   * @param title - title of the dialog box
   * @param bodyText - the body message of the confirm dialog
   * @param buttonLabels array of two string, first test is the confirm text, while second text is the cancel text.
   *
   * @returns {promise |*|}
   */
  var getConfirmDialogBox = function(title, bodyText, buttonLabels) {
    var confirmDialog = $modal.open({
      templateUrl: 'views/notification-service/confirm-dialog.html',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        modalParams: function($q) {
          var deferred = $q.defer();
          var modalText = {
            title: title,
            bodyText: bodyText,
            buttonLabels: {
              YES: buttonLabels[0],
              NO: buttonLabels[1]
            }
          };
          deferred.resolve(modalText);
          return deferred.promise;
        }
      },
      controller: function($scope, $state, $modalInstance, modalParams) {
        $scope.headerMessage = !angular.isArray(modalParams.title) ? modalParams.title : '';
        $scope.headerMessage2 = modalParams.title;
        $scope.bodyMessage = modalParams.bodyText;
        $scope.confirmBtnMsg = modalParams.buttonLabels.YES;
        $scope.cancelBtnMsg = modalParams.buttonLabels.NO;
        $scope.confirm = $modalInstance.close;
        $scope.cancel = $modalInstance.dismiss;
        $scope.dismissMessage = 'Cancel confirm dialog';
      }
    });
    return confirmDialog.result;
  };

  var isMobileDialogAvailable = function() {
    return (typeof navigator.notification !== 'undefined') && (typeof navigator.notification.confirm !== 'undefined');
  };

  var getMobileConfirmDialog = function(title, bodyText, buttonLabels) {
    var deferred = $q.defer();
    bodyText = angular.isArray(title) ? title.join('\n') + '\n\n' + bodyText : bodyText;
    title = angular.isArray(title) ? i18n('confirmStockOutHeader2') : title;
    if (isMobileDialogAvailable()) {
      navigator.notification.confirm(bodyText, function(index) {
        var YES_INDEX = 1; //position in buttonLabels text + 1.
        if (index === YES_INDEX) {
          deferred.resolve(true);
        } else {
          deferred.reject('Cancel confirm dialog');
        }
      }, title, buttonLabels);
    } else {
      deferred.resolve('mobile dialog is not available');
    }
    return deferred.promise;
  };

  this.getConfirmDialog = function(title, bodyText, buttonLabels) {
    buttonLabels = buttonLabels || [i18n('yes'), i18n('no')];
    if (isMobileDialogAvailable()) {
      return getMobileConfirmDialog(title, bodyText, buttonLabels);
    }
    return getConfirmDialogBox(title, bodyText, buttonLabels);
  };

  //break object into naively couchable chunks to JSON encode
  //TODO: better encoding. uuids are huge, msgpack doesn't help.
  var encode = function(obj) {
    var s = JSON.stringify(obj);
    if (s.length > 140) {
      var strings = [];
      for (var i in obj) {
        if (i === 'uuid' || i === 'db'){
          continue;
        }
        var chunk = {uuid: obj.uuid, db: obj.db};
        chunk[i] = obj[i];
        strings.push(JSON.stringify(chunk).substr(0, 140));
      }
      return strings;
    }
    else {
      return [s];
    }
  };

  var _send = function(phoneNo, content, intent) {
    var deferred = $q.defer();
    var success = function() {
      deferred.resolve(true);
    };
    var failure = function(error) {
      var error = error || 'pha!';
      $window.sms.send(phoneNo, ('sms-failed: ' + error).substr(0, 140), intent);
      deferred.reject(error);
    };
    $window.sms.send(phoneNo, content, intent, success, failure);
    return deferred.promise;
  };

  /**
   * @param phoneNo{String} - recipient phone number
   * @param msg{String} - message body
   * @returns {promise|Function|promise|promise|promise|*}
   */
  /**
   * Resolves true if message was sent but does not mean sms has been delivered to recipient.
   * @param phoneNo{String} - recipient phone number
   * @param msg{String} - message body
   * @returns {promise|Function|promise|promise|promise|*}
   */
  this.sendSms = function(phoneNo, msg, type) {

    var deferred = $q.defer();
    var promises = [];
    var intent = '';//leave empty for sending sms using default intent(SMSManager)

    if (utility.has($window, 'sms')) {
      msg.db = type;
      var content = encode(msg);
      for (var i in content) {
        promises.push(_send(phoneNo, content[i], intent));
      }
      deferred.resolve(true);
    } else {
      deferred.reject(noSmsSupportMsg);
    }
    return deferred.promise;
  };


});
