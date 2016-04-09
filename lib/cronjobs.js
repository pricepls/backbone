/**
 * Created by adarsh.raj on 10/6/15.
 */


var crontab = require('node-crontab');

var mongodb = require('./mongodb');
var mysql = require('./mysqldb')();
mysql.init();
var async = require('async');
var util = require('./util');
var gcm = require('./gcm');
var spruce = require('spruce').init();
var constants = require('../constants');
var crop = require('./crop');
console.log(JSON.stringify(crop));
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

function updateBestOffertoVendors() {
    //console.log("best offer cron");
    var cronid = 2;
    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        var last_run = settings.last_run;
        var current_time = new Date().getTime();
        mongodb.getRequestsForCron(last_run, function (err, requests) {
            //spruce.info("CRON 2 requests);

            if (err)
                console.log('Err while getting the request', err);
            else {

                var best_stay_hotel = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                var best_stay_homestay = 0;
                var best_stay_resort = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                var best_stay_houseboat = 0;
                async.forEach(requests, function (eachRequest, callback) {


                    var notified_vendors = eachRequest.notified_vendors;
                    async.forEach(notified_vendors, function (eachNotifiedvendors, callback) {

                        var vendor_id = parseInt(eachNotifiedvendors.vendor_id);
                        var query = {
                            vendor_id: vendor_id
                        }
                        var projection = {
                            category_id: 1,
                            subcategory_id: 1,
                            star_rating: 1
                        }
                        mongodb.getVendorListingForCron(query, projection, function (err, listing) {

                            if (err)
                                return callback(err);
                            //console.log(listing);
                            var vendor_category = listing.category_id;
                            var vendor_subcategory = listing.subcategory_id;
                            var vendor_star_rating = parseInt(listing.star_rating);
                            var each_vendors_price = eachNotifiedvendors.pp_price;
                            var vendor_best_price = 0;
                            async.forEach(each_vendors_price, function (each_vendor_each_price, callback) {

                                //console.log(vendor_category+' '+vendor_subcategory+' '+vendor_star_rating);
                                //console.log('best stay hotel'+JSON.stringify(best_stay_hotel));
                                if (vendor_category == 1) {

                                    if (vendor_subcategory == 1) {
                                        var current_best = best_stay_hotel[vendor_star_rating];
                                        vendor_best_price = current_best;
                                        //console.log(current_best);
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        //console.log('vendor best '+vendor_best);
                                        if (current_best == 0 || vendor_best < current_best) {
                                            best_stay_hotel[vendor_star_rating] = vendor_best;
                                            vendor_best_price = vendor_best;
                                        }

                                        //console.log('best stay hotel after update'+JSON.stringify(best_stay_hotel));

                                    } else if (vendor_subcategory == 2) {
                                        var current_best = best_stay_homestay;
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if (current_best == 0 || vendor_best < current_best) {
                                            best_stay_homestay = vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    } else if (vendor_subcategory == 3) {
                                        var current_best = best_stay_resort[vendor_star_rating];
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if (current_best == 0 || vendor_best < current_best) {
                                            best_stay_resort = vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    }
                                    else {
                                        var current_best = best_stay_houseboat;
                                        vendor_best_price = current_best;
                                        var vendor_best = parseInt(each_vendor_each_price.price);
                                        if (current_best == 0 || vendor_best < current_best) {
                                            best_stay_houseboat = vendor_best;
                                            vendor_best_price = vendor_best;
                                        }
                                    }

                                    callback();
                                } else {
                                    callback();
                                }


                            }, function (err) {
                                var query = {
                                    request_id: eachRequest.request_id,
                                    "notified_vendors.vendor_id": parseInt(vendor_id)
                                }
                                mongodb.updateBestPrice(query, vendor_best_price, function (err, status) {

                                    spruce.info("updateBestPrice  vendor id " + vendor_id + ' request_id ' + request_id + status + vendor_best_price);
                                    if (!err)
                                        callback();
                                })

                            })


                        })

                    }, function (err) {
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

                }, function (err) {

                    mongodb.setCronSettings(cronid, function (err, status) {

                    });

                });


            }

        })


    });


}
function updateBestOffer() {
    //console.log("best offer cron");
    var cronid = 2;
    spruce.info("CRON STARTED " + cronid);
    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        var last_run = '';
        var current_time = new Date().getTime();

        if (settings) {

            last_run = settings.last_run;
        }
        else {
            last_run = current_time;
        }

        var query = {
            status: 'active',
            updated_at: {$gte: last_run}
        }
        var projection = {
            notified_vendors: 1,
            best_offers: 1,
            request_id: 1
        }
        mongodb.getRequestsForCron(last_run, query, projection, function (err, requests) {
            //spruce.info("updateBestOffer  requests "+JSON.stringify(requests));

            if (err)
                console.log('Err while getting the request', err);
            else {


                async.forEach(requests, function (eachRequest, callback) {

                    var best_stay_hotel = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                    var best_stay_homestay = 0;
                    var best_stay_resort = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                    var best_stay_houseboat = 0;
                    var vendor_data = [];

                    var notified_vendors = eachRequest.notified_vendors;
                    async.forEach(notified_vendors, function (eachNotifiedvendors, callback) {
                        var each_vendor_data = {};
                        var vendor_id = parseInt(eachNotifiedvendors.vendor_id);
                        //each_vendor_data.vendor_id = vendor_id;
                        var query = {
                            vendor_id: vendor_id
                        }
                        var projection = {

                            category_id: 1,
                            subcategory_id: 1,
                            star_rating: 1,
                            vendor_id: 1
                        }
                        mongodb.getVendorListingForCron(query, projection, function (err, listing) {

                            if (err)
                                return callback(err);
                            //console.log(listing);

                            if (listing !== null) {

                                var vendor_category = listing.category_id;
                                var vendor_subcategory = listing.subcategory_id;
                                var vendor_star_rating = parseInt(listing.star_rating);
                                var each_vendors_price = eachNotifiedvendors.pp_price;
                                each_vendor_data.vendor_id = listing.vendor_id;
                                each_vendor_data.category = vendor_category;
                                each_vendor_data.subcategory = vendor_subcategory;
                                each_vendor_data.star_rating = vendor_star_rating;
                                //console.log("each vendor data "+JSON.stringify(each_vendor_data));
                                //console.log(vendor_data);
                                vendor_data.push(each_vendor_data);
                                async.forEach(each_vendors_price, function (each_vendor_each_price, callback) {

                                    //console.log(vendor_category+' '+vendor_subcategory+' '+vendor_star_rating);
                                    //console.log('best stay hotel'+JSON.stringify(best_stay_hotel));
                                    if (vendor_category == 1) {

                                        if (vendor_subcategory == 1) {
                                            var current_best = best_stay_hotel[vendor_star_rating];
                                            //console.log(current_best);
                                            var vendor_best = parseInt(each_vendor_each_price.price);
                                            //console.log('vendor best '+vendor_best);
                                            if (current_best == 0 || vendor_best < current_best) {
                                                best_stay_hotel[vendor_star_rating] = vendor_best;
                                            }

                                            //console.log('best stay hotel after update'+JSON.stringify(best_stay_hotel));

                                        } else if (vendor_subcategory == 2) {
                                            var current_best = best_stay_homestay;
                                            var vendor_best = parseInt(each_vendor_each_price.price);
                                            if (current_best == 0 || vendor_best < current_best) {
                                                best_stay_homestay = vendor_best;
                                            }
                                        } else if (vendor_subcategory == 3) {
                                            var current_best = best_stay_resort[vendor_star_rating];
                                            var vendor_best = parseInt(each_vendor_each_price.price);
                                            if (current_best == 0 || vendor_best < current_best) {
                                                best_stay_resort = vendor_best;
                                            }
                                        }
                                        else {
                                            var current_best = best_stay_houseboat;
                                            var vendor_best = parseInt(each_vendor_each_price.price);
                                            if (current_best == 0 || vendor_best < current_best) {
                                                best_stay_houseboat = vendor_best;
                                            }
                                        }
                                        callback();
                                    } else {
                                        callback();
                                    }


                                }, function (err) {
                                    callback();
                                })

                            } else {
                                callback();
                            }
                        })

                    }, function (err) {
                        //console.log("Call back came till here");

                        var query = {
                            request_id: eachRequest.request_id
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
                            best_offers: best_offers
                        }


                        mongodb.updateBestPrice(query, update_params, function (err, status) {

                            //console.log("udpated for the request id "+eachRequest.request_id+status);

                            async.forEach(vendor_data, function (vendor, callback) {
                                //console.log(vendor);

                                var query = {
                                    request_id: eachRequest.request_id,
                                    "notified_vendors.vendor_id": vendor.vendor_id
                                }
                                var best_price = 0;
                                if (vendor.category == 1) {

                                    if (vendor.subcategory == 1) {
                                        best_price = best_stay_hotel[vendor.star_rating];

                                    } else if (vendor.subcategory == 2) {
                                        best_price = best_stay_homestay;

                                    } else if (vendor.subcategory == 3) {
                                        best_price = best_stay_resort[vendor.star_rating];

                                    }
                                    else {
                                        best_price = best_stay_houseboat;

                                    }

                                }

                                mongodb.updateVendorPrice(query, best_price, function (err, status) {

                                    spruce.info("udpated for the vendor id " + vendor.vendor_id + ' status ' + status + ' best price ' + best_price);
                                    if (!err)
                                        callback();
                                })

                            }, function (err) {

                                callback();
                            })
                        });

                        //console.log("best offers"+best_offers);


                    });

                }, function (err) {

                    mongodb.setCronSettings(cronid, function (err, status) {

                    });

                });


            }

        })


    });


}
function settlePayments() {


}


function updateGCMTOken() {

    var cronid = 1;
    spruce.info("CRON STARTED " + cronid);

    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        var last_run = '';
        var current_time = new Date().getTime();

        if (settings) {

            last_run = settings.last_run;
        }
        else {
            last_run = current_time;
        }
        mongodb.getDeviceToken(last_run, function (err, tokendata) {

            if (err)
                console.log('cron failed at @' + new Date().getTime() + err);
            else {

                var all_token_syncched = true;

                console.log("token lengths " + tokendata.length);
                if (tokendata.length == 0) {
                    all_token_syncched = false;
                }

                async.forEach(tokendata, function (eachToken, callback) {

                    mongodb.addDeviceTokenListing(eachToken.gcm_token, parseInt(eachToken.vendor_id), function (err, status) {

                        if (err)
                            console.log('cron failed at @' + new Date().getTime() + err);
                        var status_array = JSON.parse(status);
                        if (status_array.nModified == 0) {
                            all_token_syncched = false;
                        }
                        callback();

                    });

                }, function (err) {

                    console.log("all_token_syncched " + all_token_syncched);
                    if (all_token_syncched) {
                        mongodb.setCronSettings(cronid, function (err, status) {

                            console.log('CronUpdated 1' + new Date().getTime());

                        })
                    }
                });
            }
        })


    });
}

function populateCities() {

    var cronid = 3;
    logger.log("debug", "CRON STARTED populate cities");
    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        logger.log("debug", "last run from settings " + JSON.stringify(settings));

        var last_run = new Date().getTime();
        var current_time = last_run;
        logger.log("debug", "last run time is " + last_run);
        if (settings.last_run) {
            last_run = settings.last_run;
        }

        logger.log("debug", " calcualted minutes diff " + (current_time - last_run) / 60000);

        var minutes = Math.ceil((current_time - last_run) / 60000);
        logger.log("debug", "minutes after last run" + minutes);
        var categories = {};
        var cities_obj = [];
        var plan_id = [
            {"id": 1, "services": "1,2,4"},
            {"id": 2, "services": "3,4"},
            {"id": 3, "services": "4"}
        ];

        var plan_one_service_ids = [1, 2, 4];
        var plan_two_service_ids = [3, 4];
        var plan_three_service_ids = [4];

        var categories = [1, 2, 3, 4];

        var service_stay_subs = [];
        var service_acti_subs = [];
        var service_even_subs = [];
        var service_tran_subs = [];

        async.parallel([

            function (callback) {

                async.forEach(categories, function (category, callback) {

                    mysql.getAllSubtypesByCategory(category, function (err, subcategories) {

                        if (err)
                            return callback(err);
                        else {

                            async.forEach(subcategories, function (subcategory, callback) {

                                if (category == 1) {
                                    service_stay_subs.push(subcategory.id);
                                } else if (category == 2) {
                                    service_acti_subs.push(subcategory.id);
                                } else if (category == 3) {
                                    service_even_subs.push(subcategory.id);
                                } else if (category == 4) {
                                    service_tran_subs.push(subcategory.id);
                                }

                                callback();

                            }, function (err) {
                                callback();
                            });

                        }
                    });

                }, function (err) {
                    callback();
                })


            },
            function (callback) {

                mysql.getNewnModifiedCities(minutes, function (err, cities) {

                    if (err)
                        logger.log("debug", "error fetching cities" + err);
                    else {

                        logger.log("debug", "cities" + JSON.stringify(cities));
                        async.forEach(cities, function (city, callback) {
                            var each_city = {};
                            each_city.id = city.id;
                            each_city.name = city.name;
                            each_city.country_id = city.country_id;
                            each_city.state_id = city.state_id;
                            each_city.status = city.status;
                            cities_obj.push(each_city);
                            callback();

                        }, function (err) {

                            callback();

                        });
                    }

                });
            }

        ], function (err) {

            if (err)
                logger.log("debug", "err" + err);

            var city_query = {};
            async.forEach(cities_obj, function (city, callback) {

                var plans_enabled = [];
                var services_enabled = [];

                city_query = {};
                city_query.city_id = city.id;
                city_query.city_name = city.name;
                city_query.state_id = city.state_id;
                city_query.country_id = city.country_id;
                city_query.status = city.status;
                //city_query.services=[];

                var query = {
                    city_id: city.id,
                    status: 'active'
                }
                var projection = {
                    category: 1,
                    category_id: 1,
                    subcategory_id: 1,
                    subcategory: 1
                }
                var active_categories = [];
                var active_subcategories = [];

                var active_services = [];

                (function (city_query) {

                    logger.log("debug", "query" + JSON.stringify(query));

                    mongodb.getlistingofCity(query, projection, function (err, listings) {

                        if (err)
                            return callback(err);
                        else {

                            logger.log("debug", "listings for city " + city.name + JSON.stringify(listings));
                            if (listings.count > 0) {
                                callback();
                            } else {

                                async.forEach(listings, function (each_listing, callback) {

                                    var eachService = {}

                                    var listing_category = each_listing.category_id;
                                    var listing_subcategory = each_listing.subcategory_id;
                                    var listing_subcategory_name = each_listing.subcategory;

                                    if (active_categories.indexOf(listing_category) === -1) {
                                        active_categories.push(listing_category);
                                    }
                                    if (active_subcategories.indexOf(listing_subcategory) === -1) {

                                        active_subcategories.push(listing_subcategory);
                                        eachService.id = listing_category;
                                        eachService.value = listing_subcategory;
                                        eachService.name = listing_subcategory_name;

                                    }
                                    active_services.push(eachService);

                                    callback();

                                }, function (err) {

                                    //console.log(active_categories);
                                    //console.log(active_subcategories);
                                    //console.log("active services "+JSON.stringify(active_services));

                                    active_categories.forEach(function (cat) {
                                        if (plan_one_service_ids.indexOf(cat) !== -1) {
                                            if (plans_enabled.indexOf(1) === -1)
                                                plans_enabled.push(1);

                                        }
                                        if (plan_two_service_ids.indexOf(cat) !== -1) {
                                            if (plans_enabled.indexOf(2) === -1)
                                                plans_enabled.push(2);

                                        }
                                        if (plan_three_service_ids.indexOf(cat) !== -1) {

                                            if (plans_enabled.indexOf(3) === -1)
                                                plans_enabled.push(3);
                                        }

                                    });

                                    var service_enabled = [];
                                    var previous_serv;
                                    var previous_sub;

                                    var each_one = {};
                                    var each_not_pushed = true;
                                    active_services.forEach(function (ser) {

                                        if (!previous_serv) {
                                            each_one.service_id = ser.id;
                                            previous_serv = ser.id;
                                            previous_sub = ser.value;
                                            each_one.sub_services = [];
                                            var sub = {
                                                subservice_id: ser.value,
                                                subservice_name: ser.name
                                            }
                                            each_one.sub_services.push(sub)
                                            //each_one.sub_services.subservice_name=ser.name;

                                        } else if (previous_serv == ser.id) {

                                            var sub = {
                                                subservice_id: ser.value,
                                                subservice_name: ser.name
                                            }
                                            each_one.sub_services.push(sub)

                                        } else if (previous_serv !== ser.id) {
                                            //previous_serv = null;
                                            //previous_sub = null;

                                            previous_serv = undefined;
                                            previous_sub = undefined;
                                            service_enabled.push(each_one);
                                            each_not_pushed = false;
                                            each_one = {};
                                            each_one.sub_services = [];
                                            each_one.service_id = ser.id;

                                            var sub = {
                                                subservice_id: ser.value,
                                                subservice_name: ser.name
                                            }
                                            each_one.sub_services.push(sub);

                                            previous_serv = ser.id;
                                            previous_sub = ser.value;

                                        }


                                    });

                                    if (each_not_pushed || Object.keys(each_one).length > 0) {
                                        service_enabled.push(each_one);
                                    }


                                    logger.log("debug", "service enabled" + JSON.stringify(service_enabled) + "length" + service_enabled.length);
                                    if (service_enabled.length == 0) {
                                        city_query.status = "disabled";
                                    }
                                    city_query.plans_enabled = plans_enabled.join(',');
                                    city_query.services = service_enabled;
                                    //city_query.sub_services = active_subcategories.join(',');

                                    if (err)
                                        return callback(err);
                                    logger.log("debug", "city query coming here" + JSON.stringify(city_query));
                                    var query = {
                                        city_id: city_query.city_id
                                    }
                                    mongodb.udpateCityandServices(query, city_query, function (err, status) {

                                        logger.log("debug", "status for city " + city_query.city_id + " is " + status);

                                        if (err)
                                            return callback(err);
                                        else
                                            callback();
                                    });

                                });


                            }
                        }

                    });

                })(city_query)


            }, function (err) {

                mongodb.setCronSettings(cronid, function (err, status) {

                });


            });


        })


    });
}
function requestFormatting() {
    var cronid = 4;


    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        if (err)
            logger.log("debug", "requestFormatting" + err);
        else {
            var last_run = '';
            var current_time = new Date().getTime();

            if (settings) {

                last_run = settings.last_run;
            }
            else {
                last_run = current_time;
            }

            logger.log("debug", "requestFormatting last run " + last_run);

            var query = {
                status: 'active',
                updated_at: {$gte: last_run}
            }
            var projection = {
                no_of_guests: 1,
                notified_vendors: 1,
                request_id: 1,
                no_of_nights: 1,
                category_id: 1,
                user_id: 1
            }
            logger.debug("requestFormatting query "+JSON.stringify(query));
            mongodb.getRequestsForCron(last_run, query, projection, function (err, requests) {

                logger.debug("requestFormatting count "+requests.length);
                if (err)
                    logger.log("debug", "requestFormatting Err while getting the request" + err);
                else {

                    logger.log("debug", "requestFormatting " + JSON.stringify(requests));

                    async.forEach(requests, function (each_request, callback) {
                        logger.debug("request id "+each_request.request_id);

                        var notifiedVendors = each_request.notified_vendors;
                        var no_of_guest = each_request.no_of_guests;
                        var no_of_night = parseInt(each_request.no_of_nights);

                        async.forEach(notifiedVendors, function (eachVendor, callback) {

                            if (eachVendor.pp_price) {

                                var listing_id = eachVendor.listing_id;

                                var accept_type = eachVendor.type;
                                var query = {
                                    listing_id: listing_id
                                }
                                var offer_type = eachVendor.type;
                                //console.log(eachVendor.pp_price);
                                mongodb.getEachVendorListing(query, function (err, lisitng) {

                                    logger.log("debug", "requestFormatting  vendor id" + listing_id + " " + JSON.stringify(lisitng));
                                    if (lisitng !== null) {

                                        var category_id = lisitng.category_id;
                                        var room_types = lisitng.prices;
                                        var roomTYPE_PRICE = [];
                                        room_types.forEach(function (roomtype) {
                                            roomTYPE_PRICE[roomtype.name] = roomtype.price;
                                        })
                                        eachVendor.pp_price.forEach(function (each_room_pprice,index) {

                                            logger.debug("index "+index);
                                            var room_acutal_price = roomTYPE_PRICE[each_room_pprice.room_type];
                                            var offer_price = each_room_pprice.price
                                            //console.log(offer_price);
                                            var discount = Math.round((room_acutal_price - offer_price) / room_acutal_price * 100);
                                            //console.log(discount);
                                            eachVendor.pp_price[index]['discount'] = discount + ' %';
                                            eachVendor.pp_price[index]['was'] = room_acutal_price;

                                            logger.log("debug", "requestFormatting no_of_guest" + no_of_guest);
                                            logger.log("debug", " requestFormatting no_of_night" + no_of_night);
                                            var final_amount = 0;

                                            if (category_id == 1) {

                                                if (accept_type === "perhead") {
                                                    final_amount = offer_price * no_of_guest * no_of_night;
                                                    eachVendor.pp_price[index]['base_amount'] = final_amount;

                                                } else {

                                                    var per_room_guests = constants.constants.guests_per_room;
                                                    var total_rooms = Math.floor(no_of_guest / per_room_guests);
                                                    final_amount = offer_price * no_of_night * total_rooms;

                                                    eachVendor.pp_price[index]['base_amount'] = final_amount;
                                                }

                                            } else if (category_id == 2 || category_id == 3 || category_id == 4) {

                                                //var per_room_guests = constants.constants.guests_per_room;
                                                //var total_rooms = Math.floor(no_of_guest/per_room_guests);
                                                final_amount = offer_price * no_of_guest;
                                                eachVendor.pp_price[index]['base_amount'] = final_amount;

                                            }


                                            var total_tax = 0;
                                            var tax_amount = 0;

                                            var luxury_tax = constants.constants.luxury_tax;
                                            var service_tax = constants.constants.service_tax;
                                            if (category_id == 1) {


                                                var total_tax = luxury_tax + service_tax;
                                                var tax_amount = Math.round((total_tax / 100) * final_amount);
                                                logger.log("debug", "requestFormatting " + tax_amount);
                                                logger.log("debug", "requestFormatting " + final_amount);
                                            } else if (category_id == 2 || category_id == 3 || category_id == 4) {

                                                var total_tax = service_tax;
                                                tax_amount = Math.round((total_tax / 100) * final_amount);

                                            }

                                            eachVendor.pp_price[index]['tax_amount'] = tax_amount;
                                            eachVendor.pp_price[index]['final_fare'] = Math.round(tax_amount + final_amount);

                                        })

                                        if (lisitng.extra_images)
                                            var request_img = lisitng.extra_images['request_list_url'];
                                        else
                                            var request_img = "https://s3-ap-southeast-1.amazonaws.com/listing.images/0000/picture_not_available.png";
                                        var area = (lisitng.area ? lisitng.area : "");
                                        var star_rating = (lisitng.star_rating ? lisitng.star_rating : "");
                                        var hotel_type = lisitng.subcategory;
                                        var hotel_name = lisitng.name;
                                        var query = {
                                            request_id: each_request.request_id,
                                            'notified_vendors': {
                                                $elemMatch: {
                                                    vendor_id: eachVendor.vendor_id,
                                                    listing_id: eachVendor.listing_id
                                                }
                                            }
                                        }
                                        var params = {
                                            $set: {
                                                'notified_vendors.$.pp_price': eachVendor.pp_price,
                                                'notified_vendors.$.request_image': request_img,
                                                'notified_vendors.$.area': area,
                                                'notified_vendors.$.stars': star_rating,
                                                'notified_vendors.$.stay_type': hotel_type,
                                                'notified_vendors.$.hotel_name': hotel_name
                                            }
                                        }

                                        mongodb.updateRequestPricing(query, params, function (err, status) {

                                            mongodb.getUserGCMToken(each_request.user_id, function (err, token) {

                                                if(err)
                                                    logger.error("user token user id "+each_request.user_id +" err"+err);
                                                else {
                                                    logger.error("user token user id "+each_request.user_id +" token"+token);
                                                    var message = {
                                                        'requestId': each_request.request_id,
                                                        'userId': each_request.user_id,
                                                        'token': token
                                                    }
                                                    gcm.sendUserGCMforResponse(message, function (err, status) {
                                                    });
                                                }
                                                callback();

                                            })


                                        });


                                    }


                                })

                            } else {
                                callback();
                            }


                        }, function (err) {

                            if (err)
                                return callback(err);
                            callback();

                        })

                    }, function (err) {

                        if (err)
                            console.log(err);

                        mongodb.setCronSettings(cronid, function (err, status) {

                        });
                    })

                }
            });

        }

    });
}
function listing_extra_images() {

    var cronid = 5;

    logger.info("started cron listing images");

    mongodb.getOfferCronSettings(cronid, function (err, settings) {

        if (err)
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
                updated_at: {$gt: last_run}
            }
            var projection = {
                _id: 0,
                listing_id: 1,
                'images': 1,
                listing_number: 1
            }
            mongodb.getListingForCron(query, projection, function (err, listings) {


                if (listings !== null) {

                    logger.info("listing_images LISTING COUNT " + listings.length + " ");

                    async.forEach(listings, function (eachListing, callback) {

                        logger.log("debug", "listing_images LISTING ID " + eachListing.listing_id + " image count " + eachListing.images.length);


                        var image = {};
                        var default_image = false;
                        var default_images = {
                            name: "default"
                        };

                        if (eachListing.images.length > 0) {

                            if (eachListing.images[0].name === "default" && eachListing.images.length > 1) {
                                image = eachListing.images[1].key;
                            } else {
                                image = eachListing.images[0].key;
                            }


                        } else {
                            image = "https://s3-ap-southeast-1.amazonaws.com/listing.images/0000/picture_not_available.png";
                            default_image = true;
                            default_images.url = image;
                            default_image.key = "picture_not_available.png";
                        }

                        logger.info("listing.images ", "image to be updated " + image);

                        if (image !== undefined) {


                            var modified_images = {
                                "booking_details_url": util.getModifiedImage(image, eachListing.listing_number, '150', '150'),
                                "request_list_url": util.getModifiedImage(image, eachListing.listing_number, '150', '300'),
                            };


                            var query = {
                                listing_id: eachListing.listing_id
                            }

                            if (default_image) {
                                var params = {
                                    $set: {extra_images: modified_images},
                                    $push: {images: default_images}
                                }
                            } else {
                                var params = {
                                    $set: {extra_images: modified_images}
                                }
                            }

                            //logger.info("listing_images"," "+JSON.stringify(params));
                            mongodb.updateListing(query, params, function (err, status) {
                                if (err)
                                    return callback(err);
                                callback();
                            });


                        }


                    }, function (err) {

                        mongodb.setCronSettings(cronid, function (err, status) {

                        });

                    })


                } else {

                    mongodb.setCronSettings(cronid, function (err, status) {

                    });

                }

            })


        }
    });


}

//var bestOffer = crontab.scheduleJob("*/1 * * * *", updateBestOffer);

crontab.scheduleJob("*/1 * * * *", listing_extra_images);
crontab.scheduleJob("*/1 * * * *", requestFormatting);
crontab.scheduleJob("*/1 * * * *", populateCities);
crontab.scheduleJob("*/1 * * * *", updateGCMTOken);

//updateGCMTOken();
//populateCities();
//requestFormatting();

//listing_extra_images();


//requestFormatting();

//var settlePayments = crontab.scheduleJob("*/5 * * * *", settlePayments); */
