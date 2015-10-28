"use strict"

var mongoDriver=require('mongoskin');
var configs=app.get('configs');
var mongo_server =configs.mongo.host+':'+configs.mongo.port;
var pricepls_db = mongoDriver.db('mongodb://'+mongo_server+'/pricepls');
var COLLECTION_LISTING='listings';
var COLLECTION_REQUESTS='requests';
var COLLECTION_BOOKINGS='bookings';
var COLLECTION_SETTINGS='settings';
var COLLECTION_GCM='device_tokens'
var COLLECTION_CITY = 'cities';

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

        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).sort({'created_date':-1}).toArray(function(err,requests){

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

        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).sort({'created_date':-1}).toArray(function(err,requests){

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

        pricepls_db.collection(COLLECTION_BOOKINGS).find(query,projection).sort({'requested_date':1}).toArray(function(err,bookings){

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
                if(listingDetails.length>0)
                callback(null,listingDetails[0]);
                else
                callback(null,null);
            }
        });
    },
    getVendorListingForCron:function(query,projection,callback){

        pricepls_db.collection(COLLECTION_LISTING).find(query,projection).toArray(function(err,listingDetails){

            if(err)
                callback(err,null)
            else{
                if(listingDetails.length>0)
                    callback(null,listingDetails[0]);
                else
                    callback(null,null);
            }
        });
    },
    saveGCMToken : function(vendor_id,token,callback){

        var query = {
            vendor_id : vendor_id
        };
        var current_time = parseInt(new Date().getTime());

        pricepls_db.collection(COLLECTION_GCM).update(query,{$set:{gcm_token:token,udpated_at:current_time}},{upsert:true},function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);
        });
    },

    addDeviceTokenListing:function(token,vendor_id,callback){

        var query = {
            vendor_id : parseInt(vendor_id)
        };
        var current_time = parseInt(new Date().getTime());

        pricepls_db.collection(COLLECTION_LISTING).update(query,{$set:{gcm_token:token}},function(err,status){

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
            listing_id:1,
            room_types:1

        };
        pricepls_db.collection(COLLECTION_LISTING).findOne(query,projection,function(err,listing){
            if(err)
                callback(err,null);
            else
                if(listing)
                    callback(null,listing);
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
    },
    updateImage:function(images,listing,callback){

        var query = {
            "listing_id":listing
        };
        var operate = {
             $push: { images: images }
        }
        pricepls_db.collection(COLLECTION_LISTING).update(query,operate,function(err,status){

            if(!err)
                callback(null,null);
            else
                callback(err,null);
        });
    },
    deleteImage:function(image,listing,callback){

        var query = {
            "listing_id":listing
        };
        var operate = {
            $pull: {"images":{name:image}}
        }
        pricepls_db.collection(COLLECTION_LISTING).update(query,operate,function(err,status){

            if(!err)
                callback(null,null);
            else
                callback(err,null);
        });

    },
    checkListingMatches:function(listing_id,vendor_id,callback) {

        var query = {
            listing_id: listing_id,
            vendor_id: vendor_id
        }
        pricepls_db.collection(COLLECTION_LISTING).find(query).toArray(function (err, listing) {

            if (err)
                callback(err, false);
            else if (listing.length > 0) {
                callback(null, true);
            } else {
                callback(null, false);
            }


        });
    },
    removeListing : function(listing_id,vendor_id,callback){
        var query = {
            listing_id:listing_id,
            vendor_id:vendor_id
        }
        pricepls_db.collection(COLLECTION_LISTING).remove(query,function(err){

            if(err)
                callback(err,null);
            else
                callback(null,null);
        });
    },
    getOfferCronSettings : function(cron_id,callback){

        var query = {
            cronid : cron_id
        }

        pricepls_db.collection(COLLECTION_SETTINGS).find(query).toArray(function(err,settings){

            if(err)
                callback(err,null);
            else
                if(settings.length >0)
                    callback(null,settings[0]);
                else
                    callback(null,null);

        });
    },
    setCronSettings:function(cron_id,callback){

        var query = {
            cronid:cron_id

        }
        var current_time =  new Date().getTime();
        pricepls_db.collection(COLLECTION_SETTINGS).update(query,{$set:{last_run:current_time}},{upsert:true},function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);
        });


    },
    getRequestsForCron : function(last_run,query,projection,callback){



        pricepls_db.collection(COLLECTION_REQUESTS).find(query,projection).toArray(function(err,requests){

            if(err)
                callback(err,null);
            else
                callback(null,requests);

        });

    },
    updateVendorPrice:function(query,best,callback){

        var current_time =  new Date().getTime();
        var updated_at = current_time;
        var operate = {
            $set : {"notified_vendors.$.best_price":best,"updated_at":current_time}
        }
        //console.log(operate);
        pricepls_db.collection(COLLECTION_REQUESTS).update(query,operate,function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);
        });


    },
    updateBestPrice:function(query,params,callback){

        var current_time =  new Date().getTime();
        params.updated_at = current_time;
        var operate = {
            $set : params
        }

        pricepls_db.collection(COLLECTION_REQUESTS).update(query,operate,function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);
        });
    },
    getDeviceToken:function(last_run,callback){

        var query = {

            udpated_at: {$gte: last_run}
        }
        pricepls_db.collection(COLLECTION_GCM).find(query).toArray(function(err,tokens){

            if(err)
                callback(err,null);
            else
                callback(null,tokens);

        })
    },
    getlistingofCity :function(query,projection,callback){

        pricepls_db.collection(COLLECTION_LISTING).find(query,projection).toArray(function(err,listings){

            if(err)
                callback(err,null);
            else
                callback(null,listings);

        });
    },
    udpateCityandServices :function(query,params,callback){
        var update_params = {$set:params}
        pricepls_db.collection(COLLECTION_CITY).update(query,update_params,{upsert:true},function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);

        });
    },
    updateRequestPricing :function(query,params,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).update(query,params,function(err,status){

            if(err)
                callback(err,null);
            else
                callback(null,status);

        });
    }

}
module.exports=mongo;