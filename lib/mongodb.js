"use strict"

var mongoDriver=require('mongoskin');
var configs=app.get('configs');
var pricepls_db = mongoDriver.db('mongodb://'+configs.mongo.host+'/pricepls');
var LISTING_COLLECTION='listings';

var mongo={

    createListing:function(query,callback){

        pricepls_db.collection(LISTING_COLLECTION).insert(query,function(err,success){
            if(err)
                callback(err,null);
            else
                callback(null,success);
        })
    }

}
module.exports=mongo;