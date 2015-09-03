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
                        response.status="error";
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

                        var type = 1;

                        var message = {
                            requestID : "PPR_4J_fk_mK",
                            user_name : "Adarsh Raj"
                        }

                        if(req.query.type==2){

                            type = 2;
                            var message = {
                                bookingID : "PPB_EyK_fFTF",
                                user_name : "Adarsh Raj"
                            }

                        }
                        var token_array = [token];
                        gcm.sendGCMNotification(token_array,message,type,function(err,status){

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

    },
    getBalance : function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        var vendor_id = req.query.vendor_id || undefined;
        if(vendor_id !== undefined){


            var balance = {
                balance : 300
            }
            response.status="success";
            response.data = balance;
            res.send(response);


        }else{
            response.status="error";
            response.error_code = "2003";
            response.error_msg = constants.messages["2003"];
            res.json(response);
        }

    }
}

module.exports = vendor;