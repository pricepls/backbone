var gcm = require('node-gcm');
var vendor_apiKey = 'AIzaSyDO34C66idme610wVYVNtsjbPC-ppv8TnA';


var gcm_util = {

    sendGCMNotification:function(tokens,msgdata,type,callback){

        if(type == 1){  /* New request notification */

            var message = new gcm.Message({
                collapseKey: 'New Request',
                priority: 'high',
                contentAvailable: true,
                delayWhileIdle: true,
                timeToLive: 3600*30,
                data: {
                    notification_type:1,
                    username: '',
                    requestid: ''
                },
                notification: {
                    title: "You got one New Request",
                    body: "You have received a new request from "+msgdata.user_name
                }
            });
            message.addData('username',msgdata.user_name);
            message.addData('requestid',msgdata.requestID);
            var sender = new gcm.Sender(vendor_apiKey);

            sender.send(message, tokens, function (err, status) {
                if(err) callback(err,null);
                else    callback(null,status);
            });

        }else if(type ==2){


            var message = new gcm.Message({
                collapseKey: 'New Booking',
                priority: 'high',
                contentAvailable: true,
                delayWhileIdle: true,
                timeToLive: 3600*30,
                dryRun: true,
                data: {
                    notification_type:2,
                    username: '',
                    bookingid: ''
                },
                notification: {
                    title: "You got One New Booking",
                    body: "You have received a new booking from "+msgdata.user_name
                }
            });
            message.addData('username',msgdata.user_name);
            message.addData('requestid',msgdata.bookingID);
            var sender = new gcm.Sender(vendor_apiKey);

            sender.send(message, tokens, function (err, result) {
                if(err) callback(err,null);
                else    callbck(null,status);
            });

        }
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