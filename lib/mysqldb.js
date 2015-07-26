"use stric";

var mysql=require('mysql');
var configs=app.get('configs');


module.exports=function(){

    var mysql_connect;

    return {

        init:function(){

            mysql_connect=mysql.createConnection({
                host:configs.mysql.host,
                user:configs.mysql.user,
                password:configs.mysql.password,
                database:'pricepls'
            });
            mysql_connect.connect(function(err){

                if(err)
                    console.log(err);
            });
        },
        findAdmin:function(phone,password,callback){
            var query='select id,name from admins where phone=? and password=? and status=\'active\'';
            mysql_connect.query(query,[phone,password],function(err,admin){

                if(err)
                    callback(err,null);
                else{

                    if(admin.length>0){

                        callback(null,admin[0]);
                    }else{
                        callback(null,undefined);
                    }

                }

            });
        },
        findVendor:function(phone,password,callback){
            var query='select id,name,phone,contact_no from vendors where phone=? and password=? and status=\'active\'';
            mysql_connect.query(query,[phone,password],function(err,vendor){
                if(err)
                    callback(err,null);
                else{
                    if(vendor.length>0){
                        callback(null,vendor[0]);
                    }else{
                        callback(null,undefined);
                    }
                }
            });
        },
        findVendorById:function(vendor_id,callback){
            var query = 'select name,phone,contact_no from vendors where id= ?';
            mysql_connect.query(query,[vendor_id],function(err,vendor){
                if(err){
                    callback(err,null);
                }else{

                    if(vendor.length > 0){
                        callback(null,vendor[0]);
                    }else{
                        callback(null,undefined);
                    }
                }
            });
        },
        newAdmin:function(name,phone,password,callback){

            var query = 'insert into admins (name,phone,password,created_at,status) values ("'+name+'","'+phone+'","'+password+'",NOW(),"active")';
            mysql_connect.query(query,function(err,success){
                if(err)
                    callback(err,null);
                else{
                    callback(null,success);
                }
            });
        },
        vendorExists:function(phone,callback){

            var query='select count(id) as count from vendors where phone=?';
            mysql_connect.query(query,[phone],function(err,count){

                if(err)
                    callback(err,null);
                else
                    callback(null,count[0]['count']);

            })
        },
        newVendor:function(phone,password,contact_no,name,callback){

            var query = 'insert into vendors (name,phone,password,contact_no,created_at,status) values ("'+name+'","'+phone+'","'+password+'","'+contact_no+'","NOW()","active")';
            mysql_connect.query(query,function(err,success){

                if(err)
                    callback(err,null);
                else
                    callback(null,success);
            });
        },
        getVendorsCount : function(callback){

            var query ='select count(id) as count from vendors where created_at = CURDATE()';
            mysql_connect.query(query,function(err,count){

                if(err)
                    callback(err,null);
                else
                    callback(null,count[0]['count']);

            });
        },
        getUsersCount : function(callback){

            var query = 'select count(id) as count from users where created_date = CURDATE() ';
            mysql_connect.query(query,function(err,count){

                if(err)
                    callback(err,null);
                else
                    callback(null,count[0]['count']);
            });

        }


    };
};
