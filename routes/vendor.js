var express=require('express');
var Chance=require('chance');
var chance = new Chance();
var md5=require('MD5');
var async=require('async');
var shortId=require('shortid');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');
var gcm = require('../lib/gcm');
var moment=require('moment');

mysqlDB.init();

var vendor={

    login:function(req,res,next){

        var phone=req.body.phone || undefined;
        var password=req.body.password || undefined;

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        if(phone==undefined || password==undefined){
            response.statusCode=200;
            response.status="failed";
            response.error_code="1001";
            response.error_msg=constants.messages['1001'];
            res.json(response);
        }else{

            password=md5(password);
            mysqlDB.findVendor(phone,password,function(err,vendor){

                if(err)
                    next();
                else{
                    if(vendor!==undefined){

                        mongo.getListingId(vendor.id,function(err,listingid){

                            if(err)
                                callback(err);
                            else{

                                if(listingid !== null){
                                    vendor.listing_id = listingid;
                                }else
                                    vendor.listing_id=null;

                                response.statusCode=200;
                                response.status="success";
                                response.data=vendor;
                                res.json(response);

                            }

                        })



                    }else{

                        response.statusCode=200;
                        response.status="success";
                        response.error_code="1002";
                        response.error_msg=constants.messages['1002'];
                        res.json(response);

                    }
                }
            });
        }

    },
    createVendor:function(req,res,next){


        var name=req.body.name || undefined;
        var phone=req.body.phone || undefined;
        var contactno=req.body.contactno || undefined;

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }


        if(name==undefined || phone ==undefined || contactno ==undefined){

            response.statusCode=200;
            response.status="success";
            response.error_code="3001";
            response.error_msg=constants.messages['3001'];
            res.json(response);

        }else{

            mysqlDB.vendorExists(phone,function(err,exists){

                if(err)
                    next();
                else if(exists > 0){

                    response.statusCode=200;
                    response.status="error";
                    response.error_code="2002";
                    response.error_msg=constants.messages['2002'];
                    res.json(response);

                }else{

                    var password = chance.word({length: 6});
                    var encrypted=md5(password);
                    mysqlDB.newVendor(phone,encrypted,contactno,name,function(err,success){

                        if(err)
                            next();
                        else{

                            //TODO : send mail or message
                            response.statusCode=200;
                            response.status="success";
                            res.json(response);

                        }

                    });

                }

            })

        }

    },
    createListing:function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        var area=req.body.area;
        var city=req.body.city;
        var city_id=parseInt(req.body.city_id);
        var state=req.body.state;
        var country=req.body.country;
        var lat=req.body.lat.toString();
        var long=req.body.long.toString();
        var amenities=[];
        amenities=req.body.amenities;
        var vendor_id=parseInt(req.body.vendor);
        var category=req.body.category;
        var category_id = parseInt(req.body.category_id);
        var sub_category=req.body.subcategory;
        var star_rating=req.body.star_rating;
        var vendor_obj={};
        var room_types=[];
        room_types=req.body.roomtypes;

        async.series([
            function(callback){

                mysqlDB.findVendorById(vendor_id,function(err,vendor){

                    if(err){
                        next();
                    }else{
                        if(vendor !== undefined){
                           vendor_obj.name=vendor.name;
                           vendor_obj.phone=vendor.phone.toString();
                           vendor_obj.contact_no=vendor.contact_no.toString();
                        }
                        callback();
                    }
                });
            },
            function(callback) {
                //TODO : image uploading need to be done here
                callback();
            }
        ],function(err){
            if(err)
                next(err);


            var current_time=new Date().getTime().toString();

            var listData={
                "listing_id":"PPL_"+shortId.generate(),
                "area":area,
                "city_id":city_id,
                "city":city,
                "state":state,
                "country":country,
                "latitude":lat,
                "longitude":long,
                "amenities":amenities,
                "vendor_id":vendor_id,
                "vendor_details":vendor_obj,
                "category_id":category_id,
                "category":category,
                "sub_category":sub_category,
                "star_rating":star_rating,
                "created_at": current_time,
                "modified_at": current_time,
                "images":[],
                "room_types":room_types,
                "status":"active"
            }
            mongo.createListing(listData,function(err,success){

                if(err)
                    next(err);
                else{

                    response.statusCode=200;
                    response.message="success";
                    res.json(response);

                }
            });
        });
    },
    getNewrequests:function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        var vendor_id=req.query.vendor || undefined;
        if(vendor_id !== undefined){

            var query={

                /* query using element match */
                "notified_vendors":{
                    $elemMatch:{

                        vendor_id : parseInt(vendor_id),
                        pp_price : { $exists : false }

                    }
                }

                /* query using dot operator need to validate the performance of both  */

                //"notified_vendors.vendor_id":parseInt(vendor_id)
            }
            mongo.getNewrequests(query,function(err,requests){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    response.data=requests || {};
                    res.json(response);
                }
            });
        }else{

            response.statusCode=200;
            response.status="error";
            response.error_code="2003",
            response.error_msg= constants.messages['2003']
            res.json(response);
        }
    },

    repliedRequests:function(req,res) {

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }

        var vendor_id = req.query.vendor || undefined;
        if (vendor_id !== undefined) {

            var query={
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        pp_price : { $exists : true }  }
                }
            }

            mongo.getRepliedRequests(query,function(err,requests){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    response.data=requests || {};
                    res.json(response);
                }
            });
        }else{

            response.statusCode=200;
            response.status="error";
            response.error_code="2003",
            response.error_msg= constants.messages['2003']
            res.json(response);
        }
    },
    confirmedBookings:function(req,res,next){

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }

        var vendor_id = req.query.vendor || undefined;
        if (vendor_id !== undefined) {

            var query={

                "accepted_vendor.vendor_id":parseInt(vendor_id)
            }

            mongo.confirmedBookings(query,function(err,bookings){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    response.data=bookings || {};
                    res.json(response);
                }

            });

        }else{

            response.statusCode=200;
            response.status="error";
            response.error_code="2003",
            response.error_msg= constants.messages['2003']
            res.json(response);

        }

    },
    newPrice : function(req,res,next){

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }
        var vendor_id = req.body.vendor || undefined;
        var request_id = req.body.request || undefined;
        var price = req.body.price || undefined;
        if(vendor_id === undefined && request_id !== undefined && price !== undefined){

            response.statusCode=200;
            response.status="error";
            response.error_code="2004",
            response.error_msg= constants.messages['2004']
            res.json(response);

        }else{

            var query = {
                "request_id":request_id,
                "notified_vendors.vendor_id":parseInt(vendor_id)
            }
            var operator ={$set:{"notified_vendors.$.pp_price":parseInt(price)}}
            var option = {'upsert' : true};

            mongo.newPrice(query,operator,option,function(err,success){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    res.json(response);
                }

            });

        }
    },
    getListingDetails : function(req,res,next){

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }

        var vendor_id= req.query.vendor || undefined;
        if(vendor_id === undefined){

            response.statusCode=200;
            response.status="error";
            response.error_code="2004",
            response.error_msg= constants.messages['2004']
            res.json(response);
        }else {
            var query = {
                vendor_id : parseInt(vendor_id)
            }

            mongo.getVendorListing(query, function (err, listingData) {

                if(err)
                    next(err);
                else{

                    response.statusCode=200;
                    response.status="success";
                    response.data = listingData ||{};
                    res.json(response);
                }

            });
        }

    },
    config : function(req,res,next){

        var config = {
          "LISTING":{},
          "CATEGORIES":[],
          "SUB_TYPES":[],
          "AMENITIES":[],
          "LATEST_VERSION":1,
          "FORCE_UPGRADE":false,
          "SHOW_UPDATE_MESSAGE":true
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
            //,
            //function(callback){
            //
            //    if(listing_id !== undefined){
            //
            //        callback
            //
            //    }else
            //        callback();
            //
            //}


        ],function(err){

            if(err)
                next(err);
            res.json(config);

        });
    },
    addGCMToken : function(req,res,next){

        var listing_id  = req.body.listing_id || undefined;
        var vendor_id = req.body.vendor_id || undefined;
        var gcm_token = req.body.gcm_token || undefined;
        var response={
            status:"",
            error_code:"",
            error_msg:""
        }
        if(listing_id !== undefined && vendor_id !== undefined){

            mongo.saveGCMToken(listing_id,vendor_id,gcm_token,function(err,status){

                if(err){
                    response.status="error";
                    response.error_code = "2005";
                    response.error_msg = constants.messages["2005"];
                    res.json(response);
                }else{
                    response.status="success";
                    res.json(response);
                }
            });

        }else {

            response.status="error";
            response.error_code = "2005";
            response.error_msg = constants.messages["2005"];
            res.json(response);
        }




    },
    samplegcm : function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        var listing_id = req.query.listing_id || undefined;
        if(listing_id !== undefined){


            mongo.getGCMToken(listing_id,function(err,token){

                if(err){
                    next(err);
                }else{

                    if(token !== null){

                        var message = {
                            requestID : "PPR_4J_fk_mK",
                            user_name : "Adarsh Raj"
                        }

                        gcm.sendGCMNotification(token,message,1,function(err,status){

                            if(err)
                                next(err);
                            else{

                                response.status="success";
                                response.data=status;
                                res.json(response);

                            }
                        });


                    }else{

                        response.status="error";
                        response.error_code = "2007";
                        response.error_msg = constants.messages["2007"];
                        res.json(response);

                    }

                }
            })


        }else{

            response.status="error";
            response.error_code = "2008";
            response.error_msg = constants.messages["2008"];
            res.json(response);
        }

    }

}

module.exports = vendor;