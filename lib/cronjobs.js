/**
 * Created by adarsh.raj on 10/6/15.
 */


var crontab = require('node-crontab');

var mongodb = require('./mongodb');
var async = require('async');

/*

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)

cronid : 1 // best offer cron

*/

var BESTOFFER_INTERVAL = 5 // minutes

function updateBestOffer(){

    var cronid = 1;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        var last_run = settings.last_run;
        var current_time = new Date().getTime();
        mongodb.getRequestsForCron(function(err,requests){

            if(err)
                console.log('Err while getting the request',err);
            else{


                async.forEach(requests,function(eachRequest,callback){

                    var best_stay_hotel = [{1:0},{2:0},{3:0},{4:0},{5:0}];
                    var best_stay_homestay = 0;
                    var notified_vendors = eachRequest.notified_vendors;
                    async.forEach(notified_vendors,function(eachNotifiedvendors,callback){

                        var each_vendors_price = eachNotifiedvendors.pp_price;




                    },function(err){


                    });

                },function(err){



                });


            }

        })


    });


}

function settlePayments(){


}


//var bestOffer = crontab.scheduleJob("* */5 * * * *", updateBestOffer);
//var settlePayments = crontab.scheduleJob("* */5 * * * *", settlePayments);
