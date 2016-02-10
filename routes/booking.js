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

            var booking_obj= [];
            var query={
                "accepted_vendor.vendor_id":parseInt(vendor_id)
            }
            var projection = {
                booking_id:1,
                user_details:1,
                no_of_nights:1,
                requested_date:1,
                booking_number:1,
                subcategory:1

            }

            mongo.confirmedBookings(query,projection,function(err,bookings){

                if(err)
                    next(err);
                else{

                    if(bookings !== null){

                        async.forEach(bookings,function(eachBooking,callback){

                            var booking = {};
                            booking = eachBooking;
                            booking.user_name = eachBooking.user_details.name;
                            delete booking.user_details;
                            booking_obj.push(booking);
                            callback();

                        },function(err){

                            if(err)
                                next(err);

                            response.statusCode=200;
                            response.status="success";
                            response.data=booking_obj;
                            res.json(response);
                        })


                    }else{

                        response.statusCode=200;
                        response.status="success";
                        response.message = constants.messages[2016];
                        response.data=[];
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
                        bookingData.bname = bookingData.hotel_name;
                        delete bookingData.hotel_details;
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