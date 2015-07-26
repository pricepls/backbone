var express=require('express');
var md5=require('MD5');
var async= require('async');

// loading the constants locally
var constants=app.get('constants');

//loading othe depedancies

var mysqlDB=require('../lib/mysqldb')();
mysqlDB.init();
var mongo=require('../lib/mongodb');

var admin={

    check:function(req,res){
        res.send('success');
    },
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
            mysqlDB.findAdmin(phone,password,function(err,admin){

                if(err)
                    next();
                else{
                    if(admin!==undefined){

                        response.statusCode=200;
                        response.status="success";
                        response.data=admin;
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
    createAdmin:function(req,res,next){

        var name=req.body.name || undefined;
        var phone=req.body.phone || undefined;
        var password=req.body.pass || undefined;

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }
        if(name==undefined || phone ==undefined || password ==undefined){

            response.statusCode=200;
            response.status="failed";
            response.error_code="3001";
            response.error_msg=constants.messages['3001'];
            res.json(response);

        }else{

            password=md5(password);
            mysqlDB.newAdmin(name,phone,password,function(err,admin){
                if(err)
                    next();
                else{
                    response.statusCode=200;
                    response.status="success";
                    res.json(response);
                }

            });
        }
    },
    getStatus :function(req,res,next){

        var bookings_today=0;
        var listings_today=0;
        var vendors_today=0;
        var requests_today=0;
        var users_today=0;
        var curdate= new Date();
        //curdate=curdate.setHours(0,0,0,0);
        //curdate=curdate.setTime();
        async.parallel([
            function(callback) {
                mysqlDB.getVendorsCount(function(err,count){
                    if(err)
                        return callback(err);
                    else
                        vendors_today=count;
                        callback();
                });
            },
            function(callback) {
                mysqlDB.getUsersCount(function(err,count){
                    if(err)
                        return callback(err);
                    else
                        users_today=count;
                        callback();
                });
            },
            function(callback) {
                var query={
                    'created_date':{$gte:curdate}
                }
                mongo.getlistingCount(query,function(err,count){
                    if(err)
                        return callback(err);
                    else
                        listings_today=count;
                        callback();
                });
            },
            function(callback) {
                var query={
                    'created_date':{$gte:curdate}
                }
                mongo.getBookingCount(query,function(err,count){
                    if(err)
                        return callback(err);
                    else
                        bookings_today=count;
                        callback();
                });
            }
        ], function(err) {

            if(err){
                next(err);
            }else{

                var response={};
                response.status=true;
                response.vendors=vendors_today;
                response.listings=listings_today;
                response.users=users_today;
                response.bookings=bookings_today;
                res.json(response);
            }

        });
    },
    viewAllRequests : function(req,res,next){

        var page = req.query.page || 1;
        var limit_start = (page-1)*10;
        var limit_end = page*10;
        var query = {
            'created_date':-1
        }
        mongo.getAllRequest(query,limit_start,limit_end,function(err,requests){

            if(err)
                next(err);
            else
                if(requests){
                    var response={};
                    response.status=true;
                    response.data = requests;
                }else{

                    var response={};
                    response.status=true;
                    response.data = {};
                }

                res.json(response);
        });
    }
}

module.exports = admin;