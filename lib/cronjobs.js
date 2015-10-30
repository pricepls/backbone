/**
 * Created by adarsh.raj on 10/6/15.
 */


var crontab = require('node-crontab');

var mongodb = require('./mongodb');
var mysql= require('./mysqldb')();
mysql.init();
var async = require('async');
var util = require('./util');

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
        var query = {
            status : 'active',
            updated_at:{$gte :last_run }
        }
        var projection = {
            notified_vendors:1,
            best_offers:1,
            request_id:1
        }
        mongodb.getRequestsForCron(last_run,query,projection,function(err,requests){
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

function populateCities(){

    var cronid = 3;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        var last_run = new Date().getTime();
        var current_time = last_run;
        if(settings){
          last_run = settings.last_run;
        }
        var minutes = Math.floor((current_time-last_run)/60000);
        console.log(minutes);
        var categories = {};
        var cities_obj = [];

        async.parallel([

            function(callback){

                mysql.getAllCategories(function(err,categories){

                    if(err)
                        return callback(err);
                    else{
                        async.forEach(categories,function(category,callback){
                            categories[category.id]=category.name;
                            callback();

                        },function(err){
                            callback();
                        });

                    }
                });
            },
            function(callback){

                mysql.getNewnModifiedCities(minutes,function(err,cities){

                    if(err)
                        console.log(err);
                    else{

                        async.forEach(cities,function(city,callback){
                            var each_city = {};
                            each_city.id = city.id;
                            each_city.name = city.name;
                            each_city.country_id= city.country_id;
                            each_city.state_id = city.state_id;
                            each_city.status = city.status;
                            cities_obj.push(each_city);
                            callback();

                        },function(err){

                            callback();

                        });
                    }

                });
            }

        ],function(err){

            if(err)
                console.log(err);

            var city_query = {};
            console.log(JSON.stringify(cities_obj));
            async.forEach(cities_obj,function(city,callback){
                city_query='';
                city_query = {};
                city_query.id = city.id;
                city_query.name = city.name;
                city_query.state_id = city.state_id;
                city_query.country_id = city.country_id;
                city_query.status = city.status;
                city_query.service=[];

                var query = {
                    city_id : city.id,
                    status:'active'
                }
                var projection = {
                    category:1,
                    category_id:1

                }
                var active_categories = [];

                (function(city_query){

                    mongodb.getlistingofCity(query,projection,function(err,listings){

                        if(err)
                            return  callback(err);
                        else{

                            if(listings.count>0){
                                callback();
                            }else{

                                async.forEach(listings,function(each_listing,callback){

                                    var listing_category = each_listing.category;
                                    if(active_categories.indexOf(listing_category) === -1){
                                        active_categories.push(listing_category);
                                        var each_service ={id:each_listing.category_id,name:listing_category}
                                        city_query.service.push(each_service);
                                    }
                                    callback();

                                },function(err){

                                    if(err)
                                        return callback(err);
                                    console.log(JSON.stringify(city_query));
                                    var query = {
                                        id:city_query.id
                                    }
                                    mongodb.udpateCityandServices(query,city_query,function(err,status){

                                        if(err)
                                            return callback(err);
                                        else
                                            callback();

                                    });

                                });


                            }
                        }

                    });

                })(city_query)



            },function(err){

                mongodb.setCronSettings(cronid,function(err,status){

                });


            });



        })





    });
}
function requestFormatting(){
    var cronid =4;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        if(err)
            console.log(err);
        else{
            var last_run ='';
            var current_time = new Date().getTime();

            if(settings){

                last_run = settings.last_run;
            }
            else{
                last_run = current_time;
            }


            console.log(last_run);
            var query = {
                status : 'active',
                updated_at:{$gte :last_run }
            }
            var projection = {
                notified_vendors:1,
                request_id:1
            }
            mongodb.getRequestsForCron(last_run,query,projection,function(err,requests){
                //console.log("requests"+JSON.stringify(requests));

                if(err)
                    console.log('Err while getting the request',err);
                else{



                    async.forEach(requests,function(each_request,callback){

                        var notifiedVendors = each_request.notified_vendors;
                        async.forEach(notifiedVendors,function(eachVendor,callback){

                            if(eachVendor.pp_price){

                                var listing_id = eachVendor.listing_id;
                                var query = {
                                    listing_id : listing_id
                                }
                                //console.log(eachVendor.pp_price);
                                mongodb.getVendorListing(query,function(err,lisitng){

                                    if(lisitng !== null){

                                        var room_types=lisitng.room_types;
                                        //console.log(room_types);
                                        room_types.forEach(function(roomtype,index){
                                            //console.log(index);
                                            //console.log(eachVendor.pp_price[index]);
                                            var room_acutal_price = roomtype.price;
                                            //console.log(room_acutal_price);
                                            var each_room_pprice = eachVendor.pp_price[index];
                                            var offer_price = each_room_pprice.price
                                            //console.log(offer_price);
                                            var discount = Math.round((room_acutal_price-offer_price)/room_acutal_price*100);
                                            //console.log(discount);
                                            eachVendor.pp_price[index]['discount']=discount+' %';
                                            eachVendor.pp_price[index]['was']=room_acutal_price;

                                        })

                                        var request_img = lisitng.extra_images['request_list_url'];
                                        var area = (lisitng.area ? lisitng.area : null);
                                        var star_rating = lisitng.star_rating;
                                        var hotel_type = lisitng.subcategory;
                                        var hotel_name = lisitng.vendor_details.name;
                                        console.log(request_img);

                                        var query ={
                                            request_id : each_request.request_id,
                                            'notified_vendors':{
                                                $elemMatch:{
                                                    vendor_id:eachVendor.vendor_id
                                                }
                                            }
                                        }
                                        var params ={
                                            $set:{'notified_vendors.$.pp_price':eachVendor.pp_price,'notified_vendors.$.request_image':request_img,'notified_vendors.$.area':area,'notified_vendors.$.stars':star_rating,'notified_vendors.$.stay_type':hotel_type,'notified_vendors.$.hotel_name':hotel_name}
                                        }

                                        mongodb.updateRequestPricing(query,params,function(err,status){

                                            console.log(err);
                                            console.log(status);
                                            callback();

                                        });

                                    }


                                })

                            }else{
                                callback();
                            }




                        },function(err){

                            if(err)
                                return callback(err);
                            callback();

                        })

                    },function(err){

                        if(err)
                            console.log(err);

                        mongodb.setCronSettings(cronid,function(err,status){

                        });
                    })

                }
            });

        }

    });
}
function listing_images(){

    var cronid =5;
    mongodb.getOfferCronSettings(cronid,function(err,settings){

        if(err)
            console.log(err);
        else {
            var last_run = '';
            var current_time = new Date().getTime();

            if (settings) {

                last_run = settings.last_run;
            }
            else {
                last_run = current_time;
            }
            var query = {
                updated_at :{$gt:last_run}
            }
            var projection = {
                _id:0,
                listing_id:1,
                'images':1
            }
            console.log(query);
            mongodb.getListingForCron(query,projection,function(err,listings){

                console.log(JSON.stringify(listings));
                if(listings !== null){

                   async.forEach(listings,function(eachListing,callback){

                       var image = eachListing.images[0].original_url;

                       console.log(image);
                       if(image !== undefined){

                           util.createCloundinaryImages(image,function(images){

                               var query = {
                                   listing_id:eachListing.listing_id
                               }
                               var params = {
                                   $set:{extra_images:images}
                               }
                               mongodb.updateListing(query,params,function(err,status){

                                   if(err)
                                    return callback(err);

                                   callback();
                               });
                           })
                       }

                   },function(err){

                       mongodb.setCronSettings(cronid,function(err,status){

                       });

                   })


                }

            })



        }
    });


}

var bestOffer = crontab.scheduleJob("*/1 * * * *", updateBestOffer);
var udpatingGCM = crontab.scheduleJob("*/1 * * * *", updateGCMTOken);
var populateCities = crontab.scheduleJob("*/5 * * * *", populateCities);
var requestFormatting = crontab.scheduleJob("*/1 * * * *", requestFormatting);
var listing_images =  crontab.scheduleJob("*/1 * * * *", listing_images);


//var settlePayments = crontab.scheduleJob("*/5 * * * *", settlePayments); */
