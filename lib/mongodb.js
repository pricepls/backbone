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

    getNewrequests:function(query,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).find(query).toArray(function(err,requests){

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
    getRepliedRequests:function(query,callback){

        pricepls_db.collection(COLLECTION_REQUESTS).find(query).toArray(function(err,requests){

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
    confirmedBookings:function(query,callback){

        pricepls_db.collection(COLLECTION_BOOKINGS).find(query).toArray(function(err,bookings){

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
    }

}
module.exports=mongo;