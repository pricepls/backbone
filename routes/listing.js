var express=require('express');
var async=require('async');
var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');



var listing = {


    getListingDetails: function (req, res, next) {

        var response = {
            status: ""
        }

        var vendor_id = req.query.vendor || undefined;
        if (vendor_id === undefined) {

            response.statusCode = 200;
            response.status = "error";
            response.error_code = "2004",
            response.error_msg = constants.messages['2004']
            res.json(response);
        } else {

            var query = {
                vendor_id: parseInt(vendor_id)
            }

            mongo.getVendorListing(query, function (err, listingData) {

                if (err)
                    next(err);
                else {

                    response.statusCode = 200;
                    response.status = "success";
                    response.data = listingData || {};
                    res.json(response);

                }

            });
        }

    },
    createListing: function (req, res, next) {

        var response = {
            status: "",
            error_code: "",
            error_msg: ""
        }

        var area = req.body.area;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;
        var lat = req.body.lat.toString();
        var long = req.body.long.toString();
        var vendor_id = parseInt(req.body.vendor);
        var category = req.body.category_id;
        var sub_category = req.body.subtype_id;
        var amenities = [];
        amenities = req.body.amenities;
        var star_rating = req.body.star_rating;
        var vendor_obj = {};
        var room_types = [];
        room_types = req.body.roomtypes;

        async.series([
            function (callback) {

                mysqlDB.findVendorById(vendor_id, function (err, vendor) {

                    if (err) {
                        next();
                    } else {
                        if (vendor !== undefined) {
                            vendor_obj.name = vendor.name;
                            vendor_obj.phone = vendor.phone.toString();
                            vendor_obj.contact_no = vendor.contact_no.toString();
                        }
                        callback();
                    }
                });
            },
            function (callback) {
                //TODO : image uploading need to be done here
                callback();
            }
        ], function (err) {
            if (err)
                next(err);


            var current_time = new Date().getTime().toString();

            var listData = {
                "listing_id": "PPL_" + shortId.generate(),
                "area": area,
                "city_id": city_id,
                "city": city,
                "state": state,
                "country": country,
                "latitude": lat,
                "longitude": long,
                "amenities": amenities,
                "vendor_id": vendor_id,
                "vendor_details": vendor_obj,
                "category_id": category_id,
                "category": category,
                "sub_category": sub_category,
                "star_rating": star_rating,
                "created_at": current_time,
                "modified_at": current_time,
                "images": [],
                "room_types": room_types,
                "status": "active"
            }
            mongo.createListing(listData, function (err, success) {

                if (err)
                    next(err);
                else {

                    response.statusCode = 200;
                    response.message = "success";
                    res.json(response);

                }
            });
        });


    }
}

module.exports = listing;