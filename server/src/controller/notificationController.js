const admin = require('firebase-admin');
const serviceAccount = require('./../configs/bonsai-51269-firebase-adminsdk-ba6p3-7c4b5bcc99.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
let pushNotification = (contentNotification, FcmToken) => {
    const message = {
        notification: contentNotification,
        token: FcmToken,
    };
    console.log(contentNotification);
    console.log(FcmToken);

    admin.messaging().send(message)
        .then((response) => {
            console.log('Thành công:', response);
        })
        .catch((error) => {
            console.error('Lỗi:', error);
        });
}

module.exports = {
    pushNotification
}