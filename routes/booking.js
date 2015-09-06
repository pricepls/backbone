var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');

var booking = {


    confirmedBookings:function(req,res,next){

        var response = {
            status: ""
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
    getBookingDetails : function(req,res,next){

        var response={
            status:""
        }

        var booking_id = req.query.booking_id || undefined;
        if(booking_id === undefined){

            response.status="error";
            response.error_code = "2009";
            response.error_msg = constants.messages["2009"];
            res.json(response);

        }else{

            mongo.getBookingDetails(booking_id,function(err,bookingData){

                if(err){
                    next(err);
                }else{
                    if(bookingData !==null){

                        response.status="success";
                        response.data = bookingData;
                        res.json(response);
                    }else{

                        response.status="error";
                        response.error_code = "2010";
                        response.error_msg = constants.messages["2010"];
                        res.json(response);
                    }
                }
            });
        }
    }


}

module.exports = booking;