"use strict"

var mongoDriver=require('mongoskin');
var configs=app.get('configs');
var pricepls_db = mongoDriver.db('mongodb://'+configs.mongo.host+'/pricepls');
var COLLECTION_LISTING='listings';
var COLLECTION_REQUESTS='requests';
var COLLECTION_BOOKINGS='bookings';

var mongo={

    createListing:function(query,callback){

        pricepls_db.collection(COLLECTION_LISTING).insert(query,function(err,success){
            if(err)
                callback(err,null);
            else
                callback(null,success);
        });
    },

    getNewrequests:function(query,projection,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).toArray(function(err,requests){

            if(err)
                callback(err)
            else{

                if(requests.length > 0 ){
                    callback(null,requests);

                }else{

                    callback(null,null);
                }
            }

        });
    },
    getRepliedRequests:function(query,projection,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).toArray(function(err,requests){

            if(err)
                callback(err)
            else{

                if(requests.length > 0 ){
                    callback(null,requests);

                }else{

                    callback(null,null);
                }
            }

        });
    },
    confirmedBookings:function(query,projection,callback){

        pricepls_db.collection(COLLECTION_BOOKINGS).find(query,projection).toArray(function(err,bookings){

            if(err)
                callback(err)
            else{

                if(bookings.length > 0 ){
                    callback(null,bookings);

                }else{

                    callback(null,null);
                }
            }

        });

    },
    newPrice:function(query,operator,option,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).update(query,operator,option,function(err,success){

            if(err)
                callback(err,null)
            else{
                callback(null,success);
            }
        });
    },
    getlistingCount : function(query,callback){

        pricepls_db.collection(COLLECTION_LISTING).count(query,function(err,count){

            if(err)
                callback(err,null)
            else{
                callback(null,count);
            }
        });
    },
    getBookingCount : function(query,callback){

        pricepls_db.collection(COLLECTION_BOOKINGS).count(query,function(err,count){

            if(err)
                callback(err,null)
            else{
                callback(null,count);
            }
        });
    },
    getAllRequest : function(query,start,end,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).find().skip(start).limit(end).sort(query).toArray(function(err,requests){

            if(err)
                callback(err,null)
            else{
                callback(null,requests);
            }
        });

    },
    getVendorListing : function(query,callback){

        pricepls_db.collection(COLLECTION_LISTING).find(query).toArray(function(err,listingDetails){

            if(err)
                callback(err,null)
            else{
                callback(null,listingDetails[0]);
            }
        });
    },
    saveGCMToken : function(listing_id,vendor_id,token,callback){

        var query = {
            listing_id : listing_id
        };

        pricepls_db.collection(COLLECTION_LISTING).update(query,{$set:{gcm_token:token}},{upsert:true},function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);
        });
    },
    getGCMToken : function(listing,callback){

        var query = {

            listing_id:listing
        }

        pricepls_db.collection(COLLECTION_LISTING).findOne(query,function(err,data){

            if(err)
                callback(err,null);
            else{
                if(data !==null){callback(null,data.gcm_token);}
                else callback(null,null);

            }

        });
    },
    getListingId : function(vendor,callback){

        var query = {
            vendor_id:vendor
        };
        var projection = {

            listing_id:1
        };
        pricepls_db.collection(COLLECTION_LISTING).findOne(query,projection,function(err,listing){
            if(err)
                callback(err,null);
            else
                if(listing)
                    callback(null,listing.listing_id);
                else
                    callback(null,null);
        })
    },
    getBookingDetails : function(booking,callback){

        var query = {
            booking_id : booking
        }
        var projection = {
            booking_id:1,
            user_id:1,
            user_details:1,
            booking_status:1,
            booking_date:1,
            payment_status:1,
            requested_date:1,
            no_of_guests:1,
            no_of_nights:1,
            no_of_rooms:1,
            room_type:1,
            amount:1

        }
        pricepls_db.collection(COLLECTION_BOOKINGS).find(query,projection).toArray(function(err,bookingData){

            if(err)
                callback(err,null);
            else {

                if(bookingData.length>0){
                    callback(null,bookingData);
                }else {
                    callback(null,null);
                }

            }

        });
    },
    getRequestDetails:function(request,vendor,callback){

        var query = {
            request_id:request,
            "notified_vendors.vendor_id" : parseInt(vendor)
        };
        var projection = {
            request_id:1,
            user_id: 1,
            city_id: 1,
            city: 1,
            category_name: 1,
            status: 1,
            category: 1,
            requested_date: 1,
            created_date: 1,
            no_of_guests: 1,
            no_of_nights: 1,
            origin_city_id: 3,
            origin_city: 1,
            user_details:1,
            "notified_vendors.$":1

        }
        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).toArray(function(err,requestData){

            if(err)
                callback(err,null);
            else {

                if(requestData.length>0){
                    callback(null,requestData[0]);
                }else {
                    callback(null,null);
                }
            }
        });
    }
}
module.exports=mongo;