'use strict';

angular.module('lmisChromeApp').service('notificationService', function ($modal, $q, i18n, $window) {

  var noSmsSupportMsg = 'SMS support not available!';
  this.NO_SMS_SUPPORT = noSmsSupportMsg;

  this.vibrate = function(duration){
    if(navigator.notification) {
      navigator.notification.vibrate(duration);
    }
  };

  this.beep = function(repeat){
    if(navigator.notification){
      navigator.notification.beep(repeat);
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
  var getConfirmDialogBox = function(title, bodyText, buttonLabels){
    var confirmDialog =  $modal.open({
      templateUrl: 'views/notification-service/confirm-dialog.html',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        modalParams: function ($q) {
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
      controller: function ($scope, $state, $modalInstance, modalParams) {
        $scope.headerMessage =  modalParams.title;
        $scope.bodyMessage =  modalParams.bodyText;
        $scope.confirmBtnMsg = modalParams.buttonLabels.YES;
        $scope.cancelBtnMsg = modalParams.buttonLabels.NO;
        $scope.confirm =  $modalInstance.close;
        $scope.cancel = $modalInstance.dismiss;
        $scope.dismissMessage = 'Cancel confirm dialog';
      }
    });
    return confirmDialog.result;
  };

  var isMobileDialogAvailable = function(){
    return (typeof navigator.notification !== 'undefined') && (typeof navigator.notification.confirm !== 'undefined');
  };

  var getMobileConfirmDialog = function(title, bodyText, buttonLabels){
    var deferred = $q.defer();
    if(isMobileDialogAvailable()){
      navigator.notification.confirm(bodyText, function (index) {
                var YES_INDEX = 1; //position in buttonLabels text + 1.
                if (index === YES_INDEX) {
                  deferred.resolve(true);
                } else {
                  deferred.reject('Cancel confirm dialog');
                }
              },title, buttonLabels[0]+ ',' +buttonLabels[1]);
    }else{
      deferred.resolve('mobile dialog is not available');
    }
    return deferred.promise;
  };

  this.getConfirmDialog = function(title, bodyText, buttonLabels){
    buttonLabels = buttonLabels || [i18n('yes'), i18n('no')];
    if(isMobileDialogAvailable()){
      return getMobileConfirmDialog(title, bodyText, buttonLabels);
    }
    return getConfirmDialogBox(title, bodyText, buttonLabels);
  };

  /**
   * @param phoneNo{String} - recipient phone number
   * @param msg{String} - message body
   * @returns {promise|Function|promise|promise|promise|*}
   */
  this.sendSms =  function(phoneNo, msg){
    var deferred = $q.defer();
    var intent = "";//leave empty for sending sms using default intent(SMSManager)
    if('sms' in $window){
      $window.sms.send(phoneNo, msg, intent, function () {
        deferred.resolve(true);
      }, function (error) {
        deferred.reject(error);
      });
    }else{
      deferred.reject(noSmsSupportMsg);
    }
    return deferred.promise;
  };

});