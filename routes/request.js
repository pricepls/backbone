var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');


var request = {


    getNewrequests:function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }
        var requests_obj = [];
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
            status: "",
            error_code: "",
            error_msg: ""
        }
        var requests_obj = [];
        var vendor_id = req.query.vendor || undefined;
        if (vendor_id !== undefined) {

            var query={
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        pp_price : { $exists : true }  }
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
                        response.data= request_obj;
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
            status:"",
            error_code:"",
            error_msg:""
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

            price = JSON.stringify(price);
            //var quoted_price = [];
            //for(var i=0; i <price.length; i++){
            //
            //    var each_price = {};
            //    each_price.room_type =
            //
            //    quoted_price.push(price[i]);
            //}

            //console.log(quoted_price);
            var query = {
                "request_id":request_id,
                "notified_vendors.vendor_id":parseInt(vendor_id)
            }
            var operator ={$set:{"notified_vendors.$.pp_price":price}}
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
