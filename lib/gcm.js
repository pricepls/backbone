var gcm = require('node-gcm');
var vendor_apiKey = 'AIzaSyDO34C66idme610wVYVNtsjbPC-ppv8TnA';
var consumer_apiKey = "AIzaSyBpRW6n8kCS8Zay12DY5_B9K9C93f_q7xI";


var gcm_util = {

    sendGCMNotification: function (tokens, msgdata, type, callback) {

        if (type == 1) {  /* New request notification */

            var sender = new gcm.Sender(vendor_apiKey);
            var message = new gcm.Message();
            //message.addData('username',msgdata.user_name);
            //message.addData('requestid',msgdata.requestID);
            //message.addData('notification_type',1);
            //message.addData('heading','You have a new request');
            //message.addData('body','You have a new request from '+msgdata.user_name);
            var notify_data = {
                username: msgdata.user_name,
                id: msgdata.requestID,
                notification_type: 1,
                heading: 'You have a new request',
                body: 'You have a new request from ' + msgdata.user_name
            }
            message.addData('message', notify_data);
            message.delay_while_idle = 1;
            sender.send(message, tokens, 4, function (err, result) {
                if (err) callback(err, null);
                else    callback(null, result);
            });


        } else if (type == 2) {

            var sender = new gcm.Sender(vendor_apiKey);
            var message = new gcm.Message();
            var notify_data = {
                username: msgdata.user_name,
                id: msgdata.bookingID,
                notification_type: 2,
                heading: 'You have a new booking',
                body: 'You have a new booking from ' + msgdata.user_name
            }
            message.addData('message', notify_data);
            message.delay_while_idle = 1;
            sender.send(message, tokens, 4, function (err, result) {
                if (err) callback(err, null);
                else    callback(null, result);
            });

        }
    },
    sendUserGCMforResponse: function (data, callback) {


        var sender = new gcm.Sender(consumer_apiKey);
        var message = new gcm.Message();
        var notify_data = {
            id: data.requestId,
            notification_type: 1,
            heading: 'New offer !',
            body: 'We found some offers, you may like it'
        }
        logger.debug("sendUserGCMforResponse request " + data.requestId + " user id " + data.userId + "data " + JSON.stringify(notify_data));
        message.addData('message', notify_data);
        message.delay_while_idle = 1;
        sender.send(message, data.token, 4, function (err, result) {
            if (err) {
                logger.error("sendUserGCMforResponse error" + err);
                callback(err, null);
            }
            else {
                logger.debug("sendUserGCMforResponse result " + JSON.stringify(result));
                callback(null, result);
            }
        });
    }


}

module.exports = gcm_util;


//var GCM = require('gcm').GCM;
//var apiKey = 'AIzaSyDO34C66idme610wVYVNtsjbPC-ppv8TnA';
//var gcm = new GCM(apiKey);
//
//var gcm_util = {
//
//    sendGCMNotification:function(token,callback){
//
//        var message = {
//            registration_id: token, // required
//            collapse_key: 'Collapse key',
//            'data.key1': 'test',
//            'data.key2': 'test'
//        };
//
//        gcm.send(message, function(err, messageId){
//            if (err) {
//                console.log("Something has gone wrong!");
//                callback(err,null);
//            } else {
//                console.log("Sent with message ID: ", messageId);
//                callback(null,messageId);
//            }
//        });
//
//
//
//    }
//
//
//}
//
//module.exports = gcm_util;
