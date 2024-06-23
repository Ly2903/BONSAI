"use strict";

var admin = require('firebase-admin');

var serviceAccount = require('./../configs/bonsai-51269-firebase-adminsdk-ba6p3-7c4b5bcc99.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var pushNotification = function pushNotification(contentNotification, FcmToken) {
  var message = {
    notification: contentNotification,
    token: FcmToken
  };
  console.log(contentNotification);
  console.log(FcmToken);
  admin.messaging().send(message).then(function (response) {
    console.log('Thành công:', response);
  })["catch"](function (error) {
    console.error('Lỗi:', error);
  });
};

module.exports = {
  pushNotification: pushNotification
};