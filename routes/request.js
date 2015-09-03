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
    getRequestDetails :function(req,res,next){

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }

        var request_id = req.query.request_id || undefined;
        if(request_id === undefined){

            response.status="error";
            response.error_code = "2011";
            response.error_msg = constants.messages["2011"];
            res.json(response);

        }else{

            mongo.getRequestDetails(request_id,function(err,requestData){

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
                    response.data = constants.messages['3001'];
                    res.json(response);
                }

            });

        }
    }



}
module.exports = request;
