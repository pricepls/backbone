var express=require('express');
var async=require('async');
var constants=app.get('constants');
var configs = app.get('configs');
var mysqlDB=require('../lib/mysqldb')();
var shortid= require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

var payment = {


    initRecharge : function(req,res,next){

        var key = req.body.key || undefined;
        var txnid  = shortid.generate();
        var amount = req.body.amount || undefined;
        var productinfo = req.body.productinfo || undefined;
        var firstname = req.body.firstname || undefined;
        var email = req.body.email || undefined;
        var udf1 = req.body.udf1 || undefined;
        var udf2 = req.body.udf2 || undefined;
        var udf3 = req.body.udf3 || undefined;
        var udf4 = req.body.udf4 || undefined;
        var udf5 = req.body.udf5 || undefined;
        var salt =configs.payu.merchant_salt;

        var hashstring = key+'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|'+udf1+'|'+udf2+'|'+udf3+'|'+udf4+'|'+udf5+'|'+salt;

        //mysql.insertTrancsation()






    },
    updatePayment:function(){


    }




}

module.exports = payment;
