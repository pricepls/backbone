var express=require('express');
var Chance=require('chance');
var chance = new Chance();
var md5=require('MD5');
var async=require('async');

var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');
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

                        response.statusCode=200;
                        response.status="success";
                        response.data=vendor;
                        res.json(response);

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

                    var password = md5(chance.word({length: 6}));
                    mysqlDB.newVendor(phone,password,contactno,name,function(err,success){

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

        var area=req.body.area;
        var city=req.body.city;
        var state=req.body.state;
        var country=req.body.country;
        var lat=req.body.lat;
        var long=req.body.long;
        var amenities=req.body.amentities;
        var vendor_id=req.body.vendor;
        var category=req.body.category;
        var star_rating=req.body.star_rating;
        var vendor_obj=[];
        var room_types=req.body.roomtypes || [];

        async.series([
            function(callback){

                mysqlDB.findVendorById(vendor_id,function(err,vendor){

                    if(err){
                        next();
                    }else{
                        if(vendor !== undefined){
                            vendor_obj.name=vendor.name;
                            vendor_obj.phone=vendor.phone;
                            vendor_obj.contact_no=vendor.contact_no;
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

            var listData={

                "area":area,
                "city":city,
                "state":state,
                "country":country,
                "latitude":lat,
                "longitude":long,
                "amenities":amenities,
                "vendor_id":vendor_id,
                "vendor_details":vendor_obj,
                "category":category,
                "star_rating":star_rating,
                "created_at": new Date().getTime(),
                "images":[],
                "room_types":room_types,
                "status":true
            }
            mongo.createListing(listData,function(err,success){

                if(err)
                    next(err);
                else{

                    res.statusCode=200;
                    res.message="success";
                }
            });
        });
    }

}

module.exports = vendor;