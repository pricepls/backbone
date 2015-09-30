var express=require('express');
var async=require('async');
var constants=app.get('constants');
var configs = app.get('configs');
var mysqlDB=require('../lib/mysqldb')();
mysqlDB.init();
var shortid= require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

var payment = {


    initRecharge : function(req,res,next){


        var vendor_id = req.body.vendor_id || undefined;
        var listing_id = req.body.listing_id || undefined;
        var amount = req.body.amount || undefined;
        var type = req.body.type || undefined;

        var response = {
            status : ''
        };

        if(vendor_id === undefined || listing_id === undefined || amount === undefined || type ===undefined){

            response.status='failed';
            response.error_code=2017;
            response.error_msg=constants.messages['2017'];
            res.json(response);
        }else{

            mysqlDB.createTransaction(vendor_id,listing_id,amount,type,function(err,status){

                if(err)
                    next(err);
                else{

                    response.status='success';
                    response.message=constants.messages[3008];
                    res.json(response);

                }
            });

        }





    },
    updatePayment:function(){


    }




}

module.exports = payment;
