var express=require('express');
var vendor=express.Router();
var Chance=require('chance');
var chance = new Chance();
var md5=require('MD5');

var constants=app.get('constants');
var mysqlDB=require('../lib/mysqldb')();
var mongo=require('../lib/mongodb');

mysqlDB.init();

vendor.post('/login',function(req,res){

    var phone=req.body.phone || undefined;
    var password=req.body.password || undefined;

    var response={
        status:"",
        error_code:"",
        error_msg:""
    }

    if(phone==undefined || password==undefined){
        response.statusCode=200;
        response.status="failed";
        response.error_code="1001";
        response.error_msg=constants.messages['1001'];
        res.json(response);
    }else{

        password=md5(password);
        mysqlDB.findVendor(phone,password,function(err,vendor){

            if(err)
                next();
            else{
                if(vendor!==undefined){

                    response.statusCode=200;
                    response.status="success";
                    response.data=vendor;
                    res.json(response);

                }else{

                    response.statusCode=200;
                    response.status="success";
                    response.error_code="1002";
                    response.error_msg=constants.messages['1002'];
                    res.json(response);

                }
            }
        });
    }

});

vendor.get('/view',function(req,res){

    var response={
        status:"",
        error_code:"",
        error_msg:""
    }

    var vendor_id=req.query.id || undefined;
    if(vendor_id==undefined){

        response.statusCode=200;
        response.status="success";
        response.error_code="2001";
        response.error_msg=constants.messages['2001'];
        res.json(response);

    }else{

        mongo.getVendorsDetails(vendor_id,function(err,Vdata){



        });

    }


});

vendor.post('/new',function(req,res){

    var name=req.body.name || undefined;
    var phone=req.body.phone || undefined;
    var contactno=req.body.contactno || undefined;

    var response={
        status:"",
        error_code:"",
        error_msg:""
    }


    if(name==undefined || phone ==undefined || contactno ==undefined){

        response.statusCode=200;
        response.status="success";
        response.error_code="3001";
        response.error_msg=constants.messages['3001'];
        res.json(response);

    }else{

            mysqlDB.vendorExists(phone,function(err,exists){

                if(err)
                    next();
                else if(exists > 0){

                    response.statusCode=200;
                    response.status="error";
                    response.error_code="2002";
                    response.error_msg=constants.messages['2002'];
                    res.json(response);

                }else{

                    var password = md5(chance.word({length: 6}));
                    mysqlDB.newVendor(phone,password,contactno,name,function(err,success){

                        if(err)
                            next();
                        else{

                            //TODO : send mail or message
                            response.statusCode=200;
                            response.status="success";
                            res.json(response);

                        }

                    });

                }

            })

    }



});




module.exports = vendor;