var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');


var request = {


    getNewrequests:function(req,res,next){

        var response={
            status:""
        }
        var requests_obj = [];
        var vendor_id=req.query.vendor || undefined;
        if(vendor_id !== undefined){

            var query={
                /* query using element match */
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        pp_price : { $exists : false },
                        status:{ $exists : false }
                    }
                }
                /* query using dot operator need to validate the performance of both  */

                //"notified_vendors.vendor_id":parseInt(vendor_id)
            }

            var projection = {
                request_id:1,
                user_id:1,
                requested_date:1,
                no_of_guests:1,
                no_of_nights:1,
                user_details:1
            }
            mongo.getNewrequests(query,projection,function(err,requests){

                if(err)
                    next(err);
                else{

                    if(requests !== null){

                        async.forEach(requests,function(eachrequest,callback){

                            var request = eachrequest;
                            request.name = eachrequest.user_details.name;
                            request.best_offer = 5000;
                            delete request.user_details;
                            requests_obj.push(request);
                            callback();

                        },function(err){

                            response.statusCode=200;
                            response.status="success";
                            response.data= requests_obj;
                            res.json(response);

                        });

                    }else{

                        response.statusCode=200;
                        response.status="success";
                        response.data= requests_obj;
                        res.json(response);

                    }



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
            status: ""
        }
        var requests_obj = [];
        var vendor_id = req.query.vendor || undefined;
        if (vendor_id !== undefined) {

            var query={
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        status:{ $exists : true , $eq : "accepted" },
                        pp_price :{ $exists : true }

                    }
                }
            }
            var projection = {
                request_id:1,
                user_id:1,
                requested_date:1,
                no_of_guests:1,
                no_of_nights:1,
                user_details:1

            }
            mongo.getRepliedRequests(query,projection,function(err,requests){

                if(err)
                    next(err);
                else{

                    if(requests !==null){

                        async.forEach(requests,function(eachrequest,callback){

                            var request = eachrequest;
                            request.name = eachrequest.user_details.name;
                            request.best_offer = 5000;
                            request.is_yours_best = true;
                            delete request.user_details;
                            requests_obj.push(request);
                            callback();

                        },function(err){

                            response.statusCode=200;
                            response.status="success";
                            response.data= requests_obj;
                            res.json(response);

                        });

                    }else{

                        response.statusCode=200;
                        response.status="success";
                        response.data= requests_obj;
                        res.json(response);
                    }


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
    getRequestDetails :function(req,res,next){

        var response={
            status:""
        }

        var request_id = req.query.request_id || undefined;
        var vendor_id = req.query.vendor_id || undefined;
        if(request_id === undefined && vendor_id !== undefined){

            response.status="error";
            response.error_code = "2011";
            response.error_msg = constants.messages["2011"];
            res.json(response);

        }else{

            mongo.getRequestDetails(request_id,vendor_id,function(err,requestData){

                if(err){
                    next(err);
                }else{
                    if(requestData !==null){
                        response.status="success";
                        requestData.best_offer=5000;
                        response.data = requestData;
                        res.json(response);
                    }else{
                        response.status="error";
                        response.error_code = "2012";
                        response.error_msg = constants.messages["2012"];
                        res.json(response);
                    }
                }
            });
        }
    },
    newPrice : function(req,res,next){


        var response = {
            status: ""
        }
        var vendor_id = req.body.vendor || undefined;
        var request_id = req.body.request || undefined;
        var price = req.body.price || undefined;
        var action = req.body.action || undefined;
        if(vendor_id === undefined && request_id !== undefined && action !== undefined){

            response.statusCode=200;
            response.status="error";
            response.error_code="2004",
            response.error_msg= constants.messages['2004']
            res.json(response);

        }else{

            if(action === "rejected"){
                var operator ={$set:{"notified_vendors.$.status":"rejected"},$unset:{"notified_vendors.$.pp_price":""}};

            }else{

                price = JSON.parse(price);
                var quoted_price = [];
                var keys = Object.keys(price), len = keys.length;
                for(var i = 0 ; i < len ; i++){
                    var each_quote= {};
                    each_quote.room_type= keys[i];
                    each_quote.price = price[keys[i]];
                    quoted_price.push(each_quote);
                }
                var operator ={$set:{"notified_vendors.$.pp_price":quoted_price,"notified_vendors.$.status":"accepted"}}
           }

            var query = {
                "request_id":request_id,
                "notified_vendors.vendor_id":parseInt(vendor_id)
            }



            var option = {'upsert' : true};

            mongo.newPrice(query,operator,option,function(err,success){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    response.message = constants.messages['3001'];
                    res.json(response);
                }

            });

        }
    }



}
module.exports = request;
