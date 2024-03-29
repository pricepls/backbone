var express = require('express');
var async = require('async');
var constants = app.get('constants');
var mysqlDB = require('../lib/mysqldb')();
var mongo = require('../lib/mongodb');
var request = require('../lib/request');
var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
var configs = app.get('configs');
var utils = require('../lib/util');

var uuid = require('node-uuid');

var settings = app.get("settings");

mysqlDB.init();

var listing = {


    getListingDetails: function (req, res, next) {

        var response = {
            status: ""
        }

        var vendor_id = req.query.vendor || undefined;
        if (vendor_id === undefined) {

            response.statusCode = 200;
            response.status = "error";
            response.error_code = "2004",
                response.error_msg = constants.messages['2004']
            res.json(response);
        } else {

            var config = {
                "LISTING": {},
                "CATEGORIES": [],
                "SUB_TYPES": [],
                "AMENITIES": [],
                "LATEST_VERSION": 1,
                "FORCE_UPGRADE": false,
                "SHOW_UPDATE_MESSAGE": false,
                "SHOW_LIST_BUSINESS": false
            };


            var listing_id = req.body.listing_id || undefined;

            async.parallel([


                function (callback) {

                    mysqlDB.getAllCategories(function (err, categories) {
                        if (err)
                            return callback(err)
                        else {
                            config.CATEGORIES = categories;
                            callback();
                        }
                    })

                },
                function (callback) {

                    mysqlDB.getAllAmenities(function (err, amenities) {

                        if (err)
                            return callback(err);
                        else {
                            config.AMENITIES = amenities;
                            callback();

                        }
                    });


                },
                function (callback) {

                    mysqlDB.getAllSubtypes(function (err, subtypes) {

                        if (err)
                            return callback(err);
                        else {
                            config.SUB_TYPES = subtypes;
                            callback();
                        }

                    });

                }
                ,
                function (callback) {

                    var query = {
                        vendor_id: parseInt(vendor_id)
                    }
                    mongo.getVendorListing(query, function (err, listingData) {
                        if (err)
                            next(err);
                        else {
                            if (listingData !== null) {
                                listingData.location = listingData.city + ', ' + listingData.state + ', ' + listingData.state;
                                config.LISTING = listingData;
                            } else {
                                config.LISTING = {};
                                config.SHOW_LIST_BUSINESS = true;
                            }
                            callback();
                        }
                    });


                }


            ], function (err) {

                if (err)
                    next(err);

                response.statusCode = 200;
                response.status = "success";
                response.data = config;
                res.json(response);

            });


        }

    },
    getListingDetailsNew: function (req, res, next) {

        var response = {
            status: ""
        }

        var vendor_id = req.query.vendor || undefined;
        if (vendor_id === undefined) {

            response.statusCode = 200;
            response.status = "error";
            response.error_code = "2004",
                response.error_msg = constants.messages['2004']
            res.json(response);
        } else {

            var config = {
                "LISTINGS": [],
                "CATEGORIES": [],
                "SUB_TYPES": [],
                "AMENITIES": [],
                "LATEST_VERSION": 1,
                "FORCE_UPGRADE": false,
                "SHOW_UPDATE_MESSAGE": false,
                "SHOW_LIST_BUSINESS": true

            };


            var listing_id = req.body.listing_id || undefined;

            async.parallel([


                function (callback) {

                    mysqlDB.getAllCategories(function (err, categories) {
                        if (err)
                            return callback(err)
                        else {
                            config.CATEGORIES = categories;
                            callback();
                        }
                    })

                },
                function (callback) {

                    /*mysqlDB.getAllAmenities(function(err,amenities){

                     if(err)
                     return callback(err);
                     else {
                     config.AMENITIES = amenities;
                     callback();

                     }
                     });*/


                    config.AMENITIES = amenities_configs;
                    callback();


                },
                function (callback) {

                    mysqlDB.getAllSubtypes(function (err, subtypes) {

                        if (err)
                            return callback(err);
                        else {
                            config.SUB_TYPES = subtypes;
                            callback();
                        }

                    });

                }
                ,
                function (callback) {

                    var query = {
                        vendor_id: parseInt(vendor_id)
                    }
                    mongo.getVendorListing(query, function (err, listingData) {
                        if (err)
                            next(err);
                        else {
                            if (listingData !== null) {
                                listingData.forEach(function (eachListingData) {

                                    var amenities_toShow = null;
                                    var amenities_array = eachListingData.amenities || null;

                                    if (amenities_array != null) {
                                        amenities_array.forEach(function (eachOne) {

                                            if (amenities_toShow !== null) {
                                                amenities_toShow += "," + eachOne.name;
                                            } else {
                                                amenities_toShow = eachOne.name;
                                            }

                                        })
                                        eachListingData.amenities = amenities_toShow;
                                    }

                                    eachListingData.location = eachListingData.city + ', ' + eachListingData.state + ', ' + eachListingData.state;

                                })

                                config.LISTINGS = listingData;
                            } else {
                                //config.LISTING =[];

                            }
                            callback();
                        }
                    });


                }


            ], function (err) {

                if (err)
                    next(err);

                response.statusCode = 200;
                response.status = "success";
                response.data = config;
                res.json(response);

            });


        }

    },
    newListing: function (req, res, next) {

        var response = {
            status: ""
        }
        var category_id = parseInt(req.body.category_id) || undefined;
        var category = req.body.category || undefined;
        var subtype_id = parseInt(req.body.subtype_id) || undefined;
        var subtype = req.body.subtype || undefined;
        var lat = req.body.lat || undefined;
        var long = req.body.long || undefined;
        var timingtype = null;
        var bussiness_name = req.body.bname || undefined;

        var query = {
            "latitude": lat,
            "longitude": long,
            "category_id": category_id,
            "category": category,
            "subcategory": subtype,
            "subcategory_id": subtype_id,
            "name": bussiness_name,
            "images": [],
            "status": "active"
        }

        if (category_id === 1) {

            var checkin = req.body.checkin || undefined;
            var checkout = req.body.checkout || undefined;
            var starrating = req.body.star || undefined;
            var rooms = req.body.prices || undefined;
            rooms = JSON.parse(rooms);
            var list_rooms = [];
            var keys = Object.keys(rooms), len = keys.length;
            for (var i = 0; i < len; i++) {
                var each_room = {};
                each_room.name = keys[i].trim();
                each_room.price = parseInt(rooms[keys[i]].trim());
                list_rooms.push(each_room);
            }
            var amenities = req.body.amenities || undefined;

            var amenities_toSave = [];
            if (amenities !== undefined) {
                var amenities_array = amenities.split(',');
                amenities_array.forEach(function (each_amenity) {

                    amenities_configs.forEach(function (eachAmenity) {

                        if (eachAmenity.name === each_amenity) {
                            amenities_toSave.push(eachAmenity);
                        }
                    })


                })
            }


            query.check_in = checkin;
            query.check_out = checkout;
            query.star_rating = starrating;
            query.prices = list_rooms;
            query.amenities = amenities_toSave;


        } else if (category_id === 2) {

            var timing_type_id = parseInt(req.body.timingtype);
            if (timing_type_id == 1) {
                timingtype = "Same time";
            } else {
                timingtype = "Multiple timings";
            }

            var timings = req.body.timings;
            var prefect_for = req.body.perfect_for;
            var days = req.body.days;
            var duration = req.body.duration;

            /* pricing = 1 ( same for everyone  ), 2 (diff for adults and kids ), 3 (diff for mens womens and kids)  */

            var pricing = req.body.pricing;
            /* pricing = 1 ( same for weekdays  ), 2 (diff for weekends )  */

            var weekpricing = req.body.weekpricing;



            var activity_name = req.body.activity_name;
            var inclusions = req.body.inclusions;
            query.timing_type_id = timing_type_id;
            query.timingtype = timingtype;
            query.timings = timings;
            query.prefect_for = prefect_for;
            query.days = days;
            query.duration = duration;
            query.pricing = pricing;
            query.weekpricing = weekpricing;
            //query.activity_name = activity_name;
            query.inclusions = inclusions;

            var prices = req.body.activity_prices || undefined;
            prices = JSON.parse(prices);
            var list_prices = [];
            var keys = Object.keys(prices), len = keys.length;
            for (var i = 0; i < len; i++) {
                var each_price = {};
                if(pricing !=1){
                    each_price.name = keys[i].replace("Price","").trim();
                }else{
                    each_price.name = keys[i].trim()
                }
                each_price.price = parseInt(prices[keys[i]].trim());
                list_prices.push(each_price);
            }
            query.prices = list_prices;

            /*Pricing 1 then no need to ask for head count*/

            if(pricing!="1" && (settings.head_enabled.category.indexOf(category_id)!=-1 || settings.head_enabled.sub_category.indexOf(subtype_id)!=-1)){
                query.head_count_enabled = true;
            }

        } else if (category_id == 3 || category_id == 4) {

            var duration = req.body.duration;
            var inclusions = req.body.inclusions;
            var prices = req.body.prices;
            prices = JSON.parse(prices);
            var list_prices = [];
            var keys = Object.keys(prices), len = keys.length;
            for (var i = 0; i < len; i++) {
                var each_price = {};
                each_price.name = keys[i].trim();
                each_price.price = parseInt(prices[keys[i]].trim());
                list_prices.push(each_price);
            }
            query.inclusions = inclusions;
            query.duration = duration;
            query.prices = list_prices;

            if(list_prices.length > 1 && (settings.head_enabled.category.indexOf(category_id)!=-1 || settings.head_enabled.sub_category.indexOf(subtype_id)!=-1)){
                query.head_count_enabled = true;
            }

        }
        var city_id = undefined;
        var city = undefined;
        var country_id = undefined;
        var state_id = undefined;
        var country = undefined;
        var country_short = undefined;
        var state = undefined;
        var state_short = undefined;
        var vendor_id = req.body.vendor || undefined;
        var current_time = new Date().getTime();
        var listing_id = uuid.v1();
        var vendor_obj = {};
        var location = req.body.location || undefined;
        var area = undefined;

        async.parallel([

            //function(callback){
            //
            //    var geocode_url = configs.google.geocode_url;
            //    var geocode_key = configs.google.geocode_key;
            //    var qs = "latlng="+lat+","+long+"&key="+geocode_key;
            //    var final_url = geocode_url+qs;
            //    request.makeSimpleGetRequest(final_url,function(err,data){
            //
            //        if(!err){
            //            var result = JSON.parse(data).results;
            //            if(result.length > 0){
            //                var first_component = result[2];
            //                var address_components = first_component.address_components;
            //                area = address_components[0].long_name;
            //                city = address_components[1].long_name;
            //                state = address_components[3].long_name;
            //                state_short = address_components[3].short_name;
            //                country = address_components[4].long_name;
            //                country_short = address_components[4].short_name;
            //                mysqlDB.newCounty(country,country_short,function(err,id){
            //                    if(!err)
            //                        country_id= id;
            //                    mysqlDB.newState(state,state_short,country_id,function(err,id){
            //                        if(!err)
            //                            state_id= id;
            //                        mysqlDB.newCity(city,country_id,state_id,function(err,id){
            //                            if(!err)
            //                                city_id=id;
            //                            callback();
            //                        });
            //                    });
            //                });
            //
            //            }
            //        }
            //    });
            //},


            function (callback) {

                if (location !== undefined && location.split(',').length >= 3) {
                    var location_split = location.split(',');
                    var length = location_split.length - 1;

                    city = location_split[length - 2].trim();
                    state = location_split[length - 1].trim();
                    state_short = state.substr(0, 2);
                    country = location_split[length].trim();
                    country_short = country.substr(0, 2);
                    if (length > 3) {
                        area = location_split[length - 3].trim();
                    }
                    mysqlDB.newCounty(country, country_short, function (err, id) {
                        if (!err)
                            country_id = id;
                        mysqlDB.newState(state, state_short, country_id, function (err, id) {
                            if (!err)
                                state_id = id;
                            mysqlDB.newCity(city, country_id, state_id, function (err, id) {
                                if (!err)
                                    city_id = id;
                                callback();
                            });
                        });
                    });

                } else {

                    var geocode_url = configs.google.geocode_url;
                    var geocode_key = configs.google.geocode_key;
                    var qs = "latlng=" + lat + "," + long + "&key=" + geocode_key;
                    var final_url = geocode_url + qs;
                    request.makeSimpleGetRequest(final_url, function (err, data) {

                        if (!err) {
                            var result = JSON.parse(data).results;
                            if (result.length > 0) {

                                var first_component = result[1];
                                var address_components = first_component.formatted_address;
                                var address_split = address_components.split(',');
                                var address_length = address_split.length - 1;
                                country = address_split[address_length].trim();
                                country_short = country.substr(0, 3);
                                var state_with_pin = address_split[address_length - 1].trim();
                                var state_with_pin_split = state_with_pin.split(' ');
                                state = state_with_pin_split[0];
                                state_short = state.substr(0, 3);
                                city = address_split[address_length - 2].trim();
                                area = address_split[address_length - 3].trim();
                                mysqlDB.newCounty(country, country_short, function (err, id) {
                                    if (!err)
                                        country_id = id;
                                    mysqlDB.newState(state, state_short, country_id, function (err, id) {
                                        if (!err)
                                            state_id = id;
                                        mysqlDB.newCity(city, country_id, state_id, function (err, id) {
                                            if (!err)
                                                city_id = id;
                                            callback();
                                        });
                                    });
                                });

                            }
                        }
                    });
                    //}

                }
            },
            function (callback) {

                mysqlDB.findVendorById(vendor_id, function (err, vendor) {

                    if (err)
                        return callback(err);
                    if (vendor !== undefined) {

                        vendor_obj.name = vendor.name;
                        vendor_obj.phone = vendor.phone.toString();
                        vendor_obj.contact_no = vendor.contact_no.toString();
                    }
                    callback();
                });
            },
            function (callback) {

                utils.getNextSequenceNumber("listing", function (err, number) {
                    if (err)
                        return callback(err);
                    else
                        query.listing_number = number;
                    callback();
                })


            }

        ], function (err) {

            query.listing_id = listing_id;
            query.area = area;
            query.city_id = city_id;
            query.city = city;
            query.state = state;
            query.country = country;
            query.vendor_id = parseInt(vendor_id);
            query.vendor_details = vendor_obj;
            query.created_at = current_time;
            query.updated_at = current_time;
            mongo.createListing(query, function (err, success) {

                if (err)
                    next(err);
                else {
                    response.status = "success";
                    response.message = constants.messages['3004'];
                    response.listing_id = listing_id;
                    response.listing_number = query.listing_number;
                    response.city = query.city;
                    res.json(response);
                }
            });

        })


    },
    newImage: function (req, res, next) {

        var listing_id = req.body.listing_id || undefined;
        var listing_number = req.body.listing_number || 0;
        var images = {};
        var response = {
            status: ""
        };
        async.series([

            function (callback) {

                var image_path = req.file.path;

                var public_id = parseInt(listing_number);
                utils.uploadToS3(req.file.path, req.file, public_id, function (err, imagerslt) {

                    if (err)
                        next(err);

                    else if (imagerslt) {

                        logger.debug("uploadToS3  response " + JSON.stringify(imagerslt));
                        images.name = shortid.generate();
                        //images.url=imagerslt.url;
                        images.url = imagerslt.Location;
                        images.key = imagerslt.key;
                        //images.original_url = imagerslt.url;
                        var fs = require('fs');
                        fs.unlinkSync(image_path);
                        callback();
                    }
                });
            },
            function (callback) {

                mongo.updateImage(images, listing_id, function (err, status) {
                    if (err)
                        return callback(err);
                    callback();

                });
            }

        ], function (err) {

            if (!err) {
                response.status = "success";
                response.message = constants.messages['3005'];
                images.url = utils.getModifiedImage(images.key, listing_number, '200', '200');
                delete images.original_url;
                response.data = images;
                logger.debug("uploadToS3 new images response " + JSON.stringify(response));
                res.json(response);
            }

        });
    }
    ,
    deleteImage: function (req, res, next) {

        var listing_id = req.body.listing_id || undefined;
        var image_id = req.body.image_id || undefined;
        var response = {
            status: ""
        }

        mongo.deleteImage(image_id, listing_id, function (err, status) {

            if (err)
                next(err);
            else {

                response.status = "success";
                response.message = constants.messages['3006'];
                res.json(response);
            }

        });

    },
    deleteMultiImages: function (req, res, next) {

        var listing_id = req.body.listing_id || undefined;
        var image_ids = req.body.image_ids || undefined;
        var response = {
            status: ""
        }
        image_ids = image_ids.split(',');
        if (image_ids.length > 0) {

            async.forEach(image_ids, function (image_id, callback) {

                mongo.deleteImage(image_id, listing_id, function (err, status) {

                    if (err)
                        return callback(err);
                    else {

                        callback();
                    }

                });

            }, function (err) {

                response.status = "success";
                response.message = constants.messages['3006'];
                res.json(response);
            })
        }

    },
    removeListing: function (req, res, next) {

        var listing_id = req.body.listing_id || undefined;
        var vendor_id = req.body.vendor_id || undefined;
        var city = req.body.city || undefined;
        var response = {
            status: ''
        }
        if (listing_id !== undefined && vendor_id !== undefined) {

            vendor_id = parseInt(vendor_id);
            mongo.checkListingMatches(listing_id, vendor_id, function (err, status) {

                if (err)
                    next(err);
                else {
                    if (status) {

                        mongo.removeListing(listing_id, vendor_id, function (err, status) {

                            if (err) {
                                next(err);
                            } else {
                                mysqlDB.setCityUpdatedTime(city);
                                response.status = 'success';
                                response.message = constants.messages['3007'];
                                res.json(response);

                            }
                        });


                    } else {

                        response.status = 'error';
                        response.error_code = 2016;
                        response.error_msg = constants.messages['2016'];
                        res.json(response);

                    }

                }
            });

        } else {
            response.status = 'error';
            response.error_code = 2016;
            response.error_msg = constants.messages['2016'];
            res.json(response);
        }
    }

}

module.exports = listing;