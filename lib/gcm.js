var GCM = require('gcm').GCM;
var apiKey = 'AIzaSyDO34C66idme610wVYVNtsjbPC-ppv8TnA';
var gcm = new GCM(apiKey);

var gcm_util = {

    sendGCMNotification:function(token,callback){

        var message = {
            registration_id: token, // required
            collapse_key: 'Collapse key',
            'data.key1': 'test',
            'data.key2': 'test'
        };

        gcm.send(message, function(err, messageId){
            if (err) {
                console.log("Something has gone wrong!");
                callback(err,null);
            } else {
                console.log("Sent with message ID: ", messageId);
                callback(null,messageId);
            }
        });



    }


}

module.exports = gcm_util;