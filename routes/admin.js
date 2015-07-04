var express=require('express');
var md5=require('MD5');


// loading the constants locally
var constants=app.get('constants');

//loading othe depedancies

var mysqlDB=require('../lib/mysqldb')();
mysqlDB.init();


var admin={

    check:function(req,res){
        res.send('success');
    },
    login:function(req,res,next){

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
            mysqlDB.findAdmin(phone,password,function(err,admin){

                if(err)
                    next();
                else{
                    if(admin!==undefined){

                        response.statusCode=200;
                        response.status="success";
                        response.data=admin;
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

    },
    createAdmin:function(req,res,next){

        var name=req.body.name || undefined;
        var phone=req.body.phone || undefined;
        var password=req.body.pass || undefined;

        var response={
            status:"",
            error_code:"",
            error_msg:""
        }
        if(name==undefined || phone ==undefined || password ==undefined){

            response.statusCode=200;
            response.status="failed";
            response.error_code="3001";
            response.error_msg=constants.messages['3001'];
            res.json(response);

        }else{

            password=md5(password);
            mysqlDB.newAdmin(name,phone,password,function(err,admin){
                if(err)
                    next();
                else{
                    response.statusCode=200;
                    response.status="success";
                    res.json(response);
                }

            });
        }
    }
}

module.exports = admin;