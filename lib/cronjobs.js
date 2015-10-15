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

function updateBestOffertoVendors(){
    //console.log("best offer cron");
    var cronid = 2;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        var last_run = settings.last_run;
        var current_time = new Date().getTime();
        mongodb.getRequestsForCron(last_run,function(err,requests){
            console.log("requests"+JSON.stringify(requests));

            if(err)
                console.log('Err while getting the request',err);
            else{

                var best_stay_hotel = {1:0,2:0,3:0,4:0,5:0};
                var best_stay_homestay = 0;
                var best_stay_resort = {1:0,2:0,3:0,4:0,5:0};
                var best_stay_houseboat= 0;
                async.forEach(requests,function(eachRequest,callback){


                    var notified_vendors = eachRequest.notified_vendors;
                    async.forEach(notified_vendors,function(eachNotifiedvendors,callback){

                        var vendor_id = parseInt(eachNotifiedvendors.vendor_id);
                        var query ={
                            vendor_id : vendor_id
                        }
                        var projection = {
                            category_id:1,
                            subcategory_id:1,
                            star_rating:1
                        }
                        mongodb.getVendorListingForCron(query,projection,function(err,listing){

                            if(err)
                                return callback(err);
                            //console.log(listing);
                            var vendor_category = listing.category_id;
                            var vendor_subcategory = listing.subcategory_id;
                            var vendor_star_rating = parseInt(listing.star_rating);
                            var each_vendors_price = eachNotifiedvendors.pp_price;
                            var vendor_best_price = 0 ;
                            async.forEach(each_vendors_price,function(each_vendor_each_price,callback){

                                //console.log(vendor_category+' '+vendor_subcategory+' '+vendor_star_rating);
                                //console.log('best stay hotel'+JSON.stringify(best_stay_hotel));
                                if(vendor_category ==1){

                                    if(vendor_subcategory ==1){
                                      var current_best = best_stay_hotel[vendor_star_rating];
                                        vendor_best_price = current_best;
                                       //console.log(current_best);
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        //console.log('vendor best '+vendor_best);
                                      if(current_best == 0 || vendor_best < current_best){
                                          best_stay_hotel[vendor_star_rating]=vendor_best;
                                          vendor_best_price = vendor_best;
                                      }

                                        //console.log('best stay hotel after update'+JSON.stringify(best_stay_hotel));

                                    }else if(vendor_subcategory ==2){
                                        var current_best = best_stay_homestay;
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_homestay=vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    }else if(vendor_subcategory ==3){
                                        var current_best = best_stay_resort[vendor_star_rating];
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_resort=vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    }
                                    else{
                                        var current_best = best_stay_houseboat;
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_houseboat=vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    }

                                    callback();
                                }else{
                                        callback();
                                }


                            },function(err){
                                var query = {
                                    request_id : eachRequest.request_id,
                                    "notified_vendors.vendor_id":parseInt(vendor_id)
                                }
                                mongodb.updateBestPrice(query,vendor_best_price,function(err,status){

                                    console.log("udpated for the request id "+vendor_id +'  ' +status+vendor_best_price);
                                    if(!err)
                                        callback();
                                })

                            })



                        })

                    },function(err){
                        //console.log("Call back came till here");


                        //var best_offers = {
                        //    "stay": {
                        //        "hotels": best_stay_hotel,
                        //        "homestay": best_stay_homestay,
                        //        "resort": best_stay_resort,
                        //        "houseboat": best_stay_houseboat
                        //    }
                        //}
                        //var update_params = {
                        //    best_offers:best_offers
                        //}
                        ////console.log("best offers"+best_offers);
                        //mongodb.updateBestPrice(query,update_params,function(err,status){
                        //
                        //    //console.log("udpated for the request id "+eachRequest.request_id+status);
                        //    if(!err){
                        //        return callback();
                        //    }
                        //});
                        callback();

                    });

                },function(err){

                    //mongodb.setCronSettings(cronid,function(err,status){
                    //
                    //});

                });


            }

        })


    });


}
function updateBestOffer(){
    //console.log("best offer cron");
    var cronid = 2;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        var last_run = settings.last_run;
        var current_time = new Date().getTime();
        console.log(last_run);
        mongodb.getRequestsForCron(last_run,function(err,requests){
            console.log("requests"+JSON.stringify(requests));

            if(err)
                console.log('Err while getting the request',err);
            else{


                async.forEach(requests,function(eachRequest,callback){

                    var best_stay_hotel = {1:0,2:0,3:0,4:0,5:0};
                    var best_stay_homestay = 0;
                    var best_stay_resort = {1:0,2:0,3:0,4:0,5:0};
                    var best_stay_houseboat= 0;
                    var vendor_data = [];

                    var notified_vendors = eachRequest.notified_vendors;
                    async.forEach(notified_vendors,function(eachNotifiedvendors,callback){
                        var each_vendor_data = {};
                        var vendor_id = parseInt(eachNotifiedvendors.vendor_id);
                        //each_vendor_data.vendor_id = vendor_id;
                        var query ={
                            vendor_id : vendor_id
                        }
                        var projection = {


                            category_id:1,
                            subcategory_id:1,
                            star_rating:1,
                            vendor_id:1
                        }
                        mongodb.getVendorListingForCron(query,projection,function(err,listing){

                            if(err)
                                return callback(err);
                            //console.log(listing);
                            var vendor_category = listing.category_id;
                            var vendor_subcategory = listing.subcategory_id;
                            var vendor_star_rating = parseInt(listing.star_rating);
                            var each_vendors_price = eachNotifiedvendors.pp_price;
                            each_vendor_data.vendor_id =listing.vendor_id;
                            each_vendor_data.category = vendor_category;
                            each_vendor_data.subcategory = vendor_subcategory;
                            each_vendor_data.star_rating = vendor_star_rating;
                            //console.log("each vendor data "+JSON.stringify(each_vendor_data));
                            //console.log(vendor_data);
                            vendor_data.push(each_vendor_data);
                            async.forEach(each_vendors_price,function(each_vendor_each_price,callback){

                                //console.log(vendor_category+' '+vendor_subcategory+' '+vendor_star_rating);
                                //console.log('best stay hotel'+JSON.stringify(best_stay_hotel));
                                if(vendor_category ==1){

                                    if(vendor_subcategory ==1){
                                        var current_best = best_stay_hotel[vendor_star_rating];
                                        //console.log(current_best);
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        //console.log('vendor best '+vendor_best);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_hotel[vendor_star_rating]=vendor_best;
                                        }

                                        //console.log('best stay hotel after update'+JSON.stringify(best_stay_hotel));

                                    }else if(vendor_subcategory ==2){
                                        var current_best = best_stay_homestay;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_homestay=vendor_best;
                                        }
                                    }else if(vendor_subcategory ==3){
                                        var current_best = best_stay_resort[vendor_star_rating];
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_resort=vendor_best;
                                        }
                                    }
                                    else{
                                        var current_best = best_stay_houseboat;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if(current_best == 0 || vendor_best < current_best){
                                            best_stay_houseboat=vendor_best;
                                        }
                                    }
                                    callback();
                                }else{
                                    callback();
                                }


                            },function(err){
                                callback();
                            })


                        })

                    },function(err){
                        //console.log("Call back came till here");

                        var query = {
                            request_id : eachRequest.request_id
                        }
                        var best_offers = {
                            "stay": {
                                "hotels": best_stay_hotel,
                                "homestay": best_stay_homestay,
                                "resort": best_stay_resort,
                                "houseboat": best_stay_houseboat
                            }
                        }
                        var update_params = {
                            best_offers:best_offers
                        }


                        mongodb.updateBestPrice(query,update_params,function(err,status){

                            //console.log("udpated for the request id "+eachRequest.request_id+status);

                            async.forEach(vendor_data,function(vendor,callback){
                                //console.log(vendor);

                                var query = {
                                    request_id : eachRequest.request_id,
                                    "notified_vendors.vendor_id":vendor.vendor_id
                                }
                                var best_price = 0;
                                if(vendor.category ==1){

                                    if(vendor.subcategory ==1){
                                        best_price = best_stay_hotel[vendor.star_rating];

                                    }else if(vendor.subcategory ==2){
                                        best_price = best_stay_homestay;

                                    }else if(vendor.subcategory ==3){
                                        best_price= best_stay_resort[vendor.star_rating];

                                    }
                                    else{
                                        best_price = best_stay_houseboat;

                                    }

                                }

                                mongodb.updateVendorPrice(query,best_price,function(err,status){

                                    console.log("udpated for the vendor id "+ vendor.vendor_id +' status ' +status +' best price '+ best_price);
                                    if(!err)
                                        callback();
                                })

                            },function(err){

                                callback();
                            })
                        });

                        //console.log("best offers"+best_offers);





                    });

                },function(err){

                    mongodb.setCronSettings(cronid,function(err,status){

                    });

                });


            }

        })


    });


}
function settlePayments(){



}


function updateGCMTOken(){

    var cronid = 1;
    mongodb.getOfferCronSettings(cronid,function(err,settings) {

        var last_run = settings.last_run;
        mongodb.getDeviceToken(last_run,function(err,tokendata){

            if(err)
                console.log('cron failed at @'+new Date().getTime()+err);
            else{

                var all_token_syncched=true;
                async.forEach(tokendata,function(eachToken,callback){

                    mongodb.addDeviceTokenListing(eachToken.gcm_token,eachToken.vendor_id,function(err,status){

                        if(err)
                            console.log('cron failed at @'+new Date().getTime()+err);
                        if(status == 0){
                            all_token_syncched= false;
                        }
                        callback();

                    });

                },function(err){

                    if(all_token_syncched) {
                        mongodb.setCronSettings(cronid, function (err, status) {

                            //console.log('CronUpdated' + new Date().getTime());

                        })
                    }
                });
            }
        })


    });
}


var bestOffer = crontab.scheduleJob("*/1 * * * *", updateBestOffer);
//var settlePayments = crontab.scheduleJob("* */5 * * * *", settlePayments);
var udpatingGCM = crontab.scheduleJob("*/1 * * * *", updateGCMTOken);

