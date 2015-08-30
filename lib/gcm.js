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
                dryRun: true,
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

            sender.send(message, tokens, function (err, result) {
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