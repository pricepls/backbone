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
    }


}
module.exports=mongo;