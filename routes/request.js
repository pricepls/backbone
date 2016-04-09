var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');
var configs = app.get('configs');


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
                status:"active",
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        pp_price : { $exists : false },
                        status:{ $exists : false }
                    }
                }
                /* query using dot operator need to validate the performance of both  */

                /*"notified_vendors.vendor_id":parseInt(vendor_id),
                "notified_vendors.pp_price":{ $exists : false },
                "notified_vendors.status":{ $exists : false }*/
            }

            var projection = {
                request_id:1,
                user_id:1,
                city_name:1,
                requested_date:1,
                checkout_date:1,
                created_date:1,
                no_of_guests:1,
                no_of_nights:1,
                user_details:1,
                'notified_vendors':1,
                'updated_at':1,
                request_number:1,

            }
            mongo.getNewrequests(query,projection,function(err,requests){

                if(err)
                    next(err);
                else{

                    if(requests !== null){

                        async.forEach(requests,function(eachrequest,callback){

                            (function (each) {

                                logger.info("getNewrequests ","count "+each.notified_vendors.length);

                                each.notified_vendors.forEach(function (eachNVendors) {

                                    logger.log("debug","getNewrequests "+"vendor_id "+parseInt(eachNVendors.vendor_id) +"requested vendor id "+vendor_id)

                                    if(parseInt(eachNVendors.vendor_id) == vendor_id && eachNVendors.status==undefined && eachNVendors.pp_price==undefined) {

                                        logger.log("debug","getNewrequests "+eachNVendors.vendor_id);

                                        var request = {};
                                        var request = JSON.parse(JSON.stringify(each));
                                        request.name = each.user_details.name;
                                        request.listing_id = eachNVendors.listing_id;
                                        request.subcategory = eachNVendors.subcategory;
                                        request.category_id = eachNVendors.category_id;

                                        request.subcategory_id = eachNVendors.subtype_id;
                                        request.unique_id = request.request_id + "##$$" + eachNVendors.listing_id;

                                        if (eachNVendors.best_price) {
                                            var best = eachNVendors.best_price;
                                            request.best_offer = "BEST OFFER Rs." + best.toString();
                                        } else {
                                            request.best_offer = "NO BEST OFFERS YET !";
                                        }
                                        request.updated_at = each.updated_at.toString();

                                        delete request.notified_vendors;
                                        delete request.user_details;
                                        requests_obj.push(request);

                                    }
                                })
                            })(eachrequest)

                            callback();

                        },function(err){


                            //requests_obj.forEach(function(each){
                            //    delete each.notified_vendors;
                            //    delete each.user_details;
                            //})


                            response.statusCode=200;
                            response.status="success";
                            response.data= requests_obj;
                            response.force_update=false;
                            res.json(response);

                        });

                    }else{

                        logger.info("newRequests "+JSON.stringify(requests_obj));

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
                status:"active",
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
                city_name:1,
                requested_date:1,
                checkout_date:1,
                created_date:1,
                no_of_guests:1,
                no_of_nights:1,
                user_details:1,
                'notified_vendors':1,
                'updated_at':1,
                request_number:1,


            }
            mongo.getRepliedRequests(query,projection,function(err,requests){

                if(err)
                    next(err);
                else{

                    if(requests !==null){

                        async.forEach(requests,function(eachrequest,callback){


                            (function (each) {

                                logger.info("repliedRequests ","count "+each.notified_vendors.length);


                                each.notified_vendors.forEach(function (eachNVendors) {


                                    logger.log("debug","repliedRequests "+"vendor_id "+parseInt(eachNVendors.vendor_id) +"requested vendor id "+vendor_id)
                                    if(parseInt(eachNVendors.vendor_id) == vendor_id) {

                                        logger.log("debug","repliedRequests "+eachNVendors.vendor_id);

                                        var request = {};
                                        var request = JSON.parse(JSON.stringify(each));
                                        request.name = each.user_details.name;
                                        request.listing_id = eachNVendors.listing_id;
                                        request.subcategory = eachNVendors.subcategory;
                                        request.category_id = eachNVendors.category_id;

                                        request.subcategory_id = eachNVendors.subtype_id;
                                        request.unique_id = request.request_id + "##$$" + eachNVendors.listing_id;

                                        if (eachNVendors.best_price) {
                                            var best = eachNVendors.best_price;
                                            request.best_offer = "BEST OFFER Rs." + best.toString();
                                        } else {
                                            request.best_offer = "NO BEST OFFERS YET !";
                                        }
                                        request.updated_at = each.updated_at.toString();

                                        delete request.notified_vendors;
                                        delete request.user_details;
                                        requests_obj.push(request);
                                    }

                                })
                            })(eachrequest)

                            callback();

                            //var request = eachrequest;
                            //request.name = eachrequest.user_details.name;
                            //if(eachrequest.notified_vendors[0].best_price){
                            //    var best=eachrequest.notified_vendors[0].best_price;
                            //    request.best_offer = best.toString();
                            //}else{
                            //    request.best_offer = "na";
                            //}
                            //request.is_yours_best = true;
                            //request.type=eachrequest.type;
                            //delete request.notified_vendors;
                            //delete request.user_details;
                            //request.updated_at = eachrequest.updated_at.toString();
                            //requests_obj.push(request);
                            //callback();

                        },function(err){

                            logger.info("repliedRequests "+JSON.stringify(requests_obj))

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
        var listing_id = req.query.listing_id || undefined;
        if(request_id === undefined && vendor_id !== undefined && listing_id !== undefined){

            response.status="error";
            response.error_code = "2011";
            response.error_msg = constants.messages["2011"];
            res.json(response);

        }else{

            mongo.getRequestDetails(request_id,vendor_id,listing_id,function(err,requestData){

                if(err){
                    next(err);
                }else{
                    if(requestData !==null){
                        response.status="success";

                        var notified_vendors = requestData.notified_vendors[0];
                        if(notified_vendors.best_price)
                            requestData.best_offer="BEST OFFER Rs." +notified_vendors.best_price;
                        else
                            requestData.best_offer='NO BEST OFFERS YET !';
                        if(notified_vendors.pp_price){
                            requestData.pp_price = notified_vendors.pp_price;
                            requestData.type=notified_vendors.type;
                        }
                        requestData.userName=requestData.user_details.name;
                        requestData.subcategory = notified_vendors.subcategory;
                        requestData.category_id = notified_vendors.category_id;

                        delete requestData.user_details;
                        delete requestData.notified_vendors;
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
        var type = req.body.type || "";
        var category = req.body.category;
        var listing= req.body.listing;
        if(vendor_id === undefined && request_id !== undefined && action !== undefined){

            response.statusCode=200;
            response.status="error";
            response.error_code="2004",
            response.error_msg= constants.messages['2004']
            res.json(response);

        }else{

            logger.info("newPrice vendorID "+vendor_id +" Request ID "+request_id+" Price "+JSON.stringify(price));

            var current_time = new Date().getTime();
            var success_msg = constants.messages['3001'];

            if(action === "rejected"){
                var operator ={$set:{"notified_vendors.$.status":"rejected"},$unset:{"notified_vendors.$.pp_price":"","notified_vendors.$.type":"",update_at:current_time}};
                success_msg= constants.messages['3009'];
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

                logger.debug("newPrice quoted price "+JSON.stringify(quoted_price));

                var operator ={$set:{"notified_vendors.$.pp_price":quoted_price,"notified_vendors.$.status":"accepted","notified_vendors.$.type":type,updated_at:current_time}}
           }

            var query = {
                "request_id":request_id,
                "notified_vendors":{
                    $elemMatch:{
                        vendor_id : parseInt(vendor_id),
                        listing_id : listing
                    }
                }
            }



            var option = {'upsert' : true};

            mongo.newPrice(query,operator,option,function(err,success){

                if(err)
                    next(err);
                else{
                    response.statusCode=200;
                    response.status="success";
                    response.message = success_msg;
                    res.json(response);
                }

            });

        }
    }



}
module.exports = request;
