var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');
var request = require('../lib/request');
var shortid= require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
var configs = app.get('configs');
var utils = require('../lib/util');

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
                "LISTING":{},
                "CATEGORIES":[],
                "SUB_TYPES":[],
                "AMENITIES":[],
                "LATEST_VERSION":1,
                "FORCE_UPGRADE":false,
                "SHOW_UPDATE_MESSAGE":false,
                "SHOW_LIST_BUSINESS":false
            };


            var listing_id = req.body.listing_id || undefined;

            async.parallel([


                function(callback){

                    mysqlDB.getAllCategories(function(err,categories){
                        if(err)
                            return callback(err)
                        else{
                            config.CATEGORIES = categories;
                            callback();
                        }
                    })

                },
                function(callback){

                    mysqlDB.getAllAmenities(function(err,amenities){

                        if(err)
                            return callback(err);
                        else {
                            config.AMENITIES = amenities;
                            callback();

                        }
                    });


                },
                function(callback){

                    mysqlDB.getAllSubtypes(function(err,subtypes){

                        if(err)
                            return callback(err);
                        else {
                            config.SUB_TYPES = subtypes;
                            callback();
                        }

                    });

                }
                ,
                function(callback){

                    var query = {
                        vendor_id: parseInt(vendor_id)
                    }
                    mongo.getVendorListing(query, function (err, listingData) {
                        if (err)
                            next(err);
                        else {
                            if(listingData !==null){
                                config.LISTING = listingData;
                            }else{
                                config.LISTING ={};
                                config.SHOW_LIST_BUSINESS = true;
                            }
                            callback();
                        }
                    });


                }


            ],function(err){

                if(err)
                    next(err);

                response.statusCode = 200;
                response.status = "success";
                response.data=config;
                res.json(response);

            });




        }

    },
    createListing: function (req, res, next) {

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }

        var area = req.body.area;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;
        var lat = req.body.lat.toString();
        var long = req.body.long.toString();
        var vendor_id = parseInt(req.body.vendor);
        var category = req.body.category_id;
        var sub_category = req.body.subtype_id;
        var amenities = [];
        amenities = req.body.amenities;
        var star_rating = req.body.star_rating;
        var vendor_obj = {};
        var room_types = [];
        room_types = req.body.roomtypes;

        async.series([
            function (callback) {

                mysqlDB.findVendorById(vendor_id, function (err, vendor) {

                    if (err) {
                        next();
                    } else {
                        if (vendor !== undefined) {
                            vendor_obj.name = vendor.name;
                            vendor_obj.phone = vendor.phone.toString();
                            vendor_obj.contact_no = vendor.contact_no.toString();
                        }
                        callback();
                    }
                });
            },
            function (callback) {
                //TODO : image uploading need to be done here
                callback();
            }
        ], function (err) {
            if (err)
                next(err);


            var current_time = new Date().getTime().toString();

            var listData = {
                "listing_id": "PPL_" + shortId.generate(),
                "area": area,
                "city_id": city_id,
                "city": city,
                "state": state,
                "country": country,
                "latitude": lat,
                "longitude": long,
                "amenities": amenities,
                "vendor_id": vendor_id,
                "vendor_details": vendor_obj,
                "category_id": category_id,
                "category": category,
                "sub_category": sub_category,
                "star_rating": star_rating,
                "created_at": current_time,
                "modified_at": current_time,
                "images": [],
                "room_types": room_types,
                "status": "active"
            }
            mongo.createListing(listData, function (err, success) {

                if (err)
                    next(err);
                else {

                    response.statusCode = 200;
                    response.message = "success";
                    res.json(response);

                }
            });
        });


    },
    newListing : function(req,res,next){

        var response = {
            status:""
        }
        var category_id = parseInt(req.body.category_id) || undefined;
        var category = req.body.category || undefined;
        var subtype_id = parseInt(req.body.subtype_id) || undefined;
        var subtype=req.body.subtype || undefined;
        var lat = req.body.lat || undefined;
        var long = req.body.long || undefined;
        if(category_id === 1){

            var checkin = req.body.checkin || undefined;
            var checkout = req.body.checkout || undefined;
            var starrating = req.body.star || undefined;
            var rooms = req.body.rooms || undefined;
            rooms = JSON.parse(rooms);
            var list_rooms = [];
            var keys = Object.keys(rooms), len = keys.length;
            for(var i = 0 ; i < len ; i++){
                var each_room= {};
                each_room.room_type= keys[i];
                each_room.price = rooms[keys[i]];
                list_rooms.push(each_room);
            }
            var amenities = req.body.amenities || undefined;


        }else if (category === 2){


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
        var current_time = new Date().getTime().toString();
        var listing_id ="PPL_"+shortid.generate();
        var vendor_obj = {};
        var location = req.body.location || undefined;
        var area = undefined;

        async.series([

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
            function(callback){

                if(location !== undefined) {
                    location_split = location.split(',');
                    area = location_split[0];
                    city = location_split[1]
                    state = location_split[2]
                    state_short = state.substr(0, 2);
                    country = location_split[3]
                    country_short = country.substr(0, 2);
                }else{

                    var geocode_url = configs.google.geocode_url;
                    var geocode_key = configs.google.geocode_key;
                    var qs = "latlng="+lat+","+long+"&key="+geocode_key;
                    var final_url = geocode_url+qs;
                    request.makeSimpleGetRequest(final_url,function(err,data){

                        if(!err){
                            var result = JSON.parse(data).results;
                            if(result.length > 0){

                                var first_component = result[1];
                                var address_components = first_component.formatted_address;
                                var address_split=address_components.split(',');
                                var address_length = address_split.length-1;
                                country = address_split[address_length].trim();
                                country_short = country.substr(0, 3);
                                var state_with_pin = address_split[address_length-1].trim();
                                var state_with_pin_split = state_with_pin.split(' ');
                                state=state_with_pin_split[0];
                                state_short = state.substr(0, 3);
                                city = address_split[address_length-2].trim();
                                area = address_split[address_length-3].trim();
                                mysqlDB.newCounty(country,country_short,function(err,id){
                                    if(!err)
                                        country_id= id;
                                    mysqlDB.newState(state,state_short,country_id,function(err,id){
                                        if(!err)
                                            state_id= id;
                                        mysqlDB.newCity(city,country_id,state_id,function(err,id){
                                            if(!err)
                                                city_id=id;
                                            callback();
                                        });
                                    });
                                });

                            }
                        }
                    });
                }


            },
            function(callback){

                mysqlDB.findVendorById(vendor_id,function(err,vendor){

                    if(err)
                        return callback(err);
                    if(vendor !== undefined){

                        vendor_obj.name = vendor.name;
                        vendor_obj.phone = vendor.phone.toString();
                        vendor_obj.contact_no = vendor.contact_no.toString();
                    }
                    callback();
                });
            },
            function(callback){

                var query={
                    "listing_id":listing_id,
                    "area":area,
                    "city_id":city_id,
                    "city":city,
                    "state":state,
                    "country":country,
                    "latitude":lat,
                    "longitude":long,
                    "amenities":amenities,
                    "vendor_id":parseInt(vendor_id),
                    "vendor_details":vendor_obj,
                    "category_id":category_id,
                    "category":category,
                    "subcategory":subtype,
                    "subcategory_id":subtype_id,
                    "check_in":checkin,
                    "check_out":checkout,
                    "star_rating":starrating,
                    "created_at": current_time,
                    "modified_at": current_time,
                    "room_types":list_rooms,
                    "images":[],
                    "status":"active"
                }
                mongo.createListing(query,function(err,success){

                    if(err)
                        return callback(err);
                    else{
                        callback();
                    }
                });

            }

        ],function(err){

            if(err)
                next(err);
            else{

                response.status ="success";
                response.message = constants.messages['3004'];
                response.listing_id = listing_id;
                res.json(response);
            }
        })


    },
    newImage : function(req,res,next){

        var listing_id = req.body.listing_id || undefined;
        var images = {};
        var response = {
            status:""
        };
        async.series([

            function(callback){

                var image_path =req.file.path;
                var public_id = 'listings/'+listing_id+'/image_'+ req.file.originalname;
                utils.uploadTocloudanary(image_path,public_id,function(imagerslt){

                    if(imagerslt){

                         images.name=shortid.generate();
                         images.url=imagerslt.url;
                         var fs = require('fs');
                         fs.unlinkSync(image_path);

                        callback();
                    }
                });
            },
            function(callback){

                mongo.updateImage(images,listing_id,function(err,status){
                    if(err)
                        return callback(err);
                    callback();

                });
            }

        ],function(err){

            if(!err){
                response.status="success";
                response.message=constants.messages['3005'];
                response.data = images;
                res.json(response);
            }

        });
    }
    ,
    deleteImage : function(req,res,next){

        var listing_id = req.body.listing_id || undefined;
        var image_id = req.body.image_id || undefined;
        var response = {
            status : ""
        }

        mongo.deleteImage(image_id,listing_id,function(err,status){

            if(err)
                next(err);
            else{

                response.status="success";
                response.message=constants.messages['3006'];
                res.json(response);
            }

        });

    },
    deleteMultiImages : function(req,res,next){

        var listing_id = req.body.listing_id || undefined;
        var image_ids = req.body.image_ids || undefined;
        var response = {
            status : ""
        }
        if(image_ids.length >0 ){

            forEach(image_ids,function(image_id,callback){

                mongo.deleteImage(image_id,listing_id,function(err,status){

                    if(err)
                       return callback(err);
                    else{

                        callback();
                    }

                });

            },function(err){

                response.status="success";
                response.message=constants.messages['3006'];
                res.json(response);
            })
        }

    },
    removeListing : function(req,res,next){

        var listing_id = req.body.listing_id || undefined;
        var vendor_id = req.body.vendor_id || undefined;
        var response = {
            status : ''
        }
        if(listing_id !== undefined  && vendor_id !== undefined){

            vendor_id=parseInt(vendor_id);
            mongo.checkListingMatches(listing_id,vendor_id,function(err,status){

               if(err)
                    next(err);
               else{
                   if(status){

                       mongo.removeListing(listing_id,vendor_id,function(err,status){

                           if(err){
                                next(err);
                           }else{

                               response.status='success';
                               response.message=constants.messages['3007'];
                               res.json(response);

                           }
                       });


                   }else{

                       response.status='error';
                       response.error_code=2016;
                       response.error_msg=constants.messages['2016'];
                       res.json(response);

                   }

               }
            });

        }else {
            response.status='error';
            response.error_code=2016;
            response.error_msg=constants.messages['2016'];
            res.json(response);
        }
    }

}

module.exports = listing;