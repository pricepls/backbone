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
        findVendorByPhone:function(phone,callback){
            var query = 'select id from vendors where phone= ?';
            mysql_connect.query(query,[phone],function(err,vendor){
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
        updateVendorPassword :function(phone,password,callback){

            var query ='update vendors set password = ? where phone = ?';
            mysql_connect.query(query,[password,phone],function(err,status){

                if(err)
                    callback(err,null);
                else{
                    callback(null,status);
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
        findVendorByIdandPwd : function(vendor_id,password,callback){

            var query = "select phone from vendors where id = ? and password =?";
            mysql_connect.query(query,[vendor_id,password],function(err,vendor){

                if(err)
                    callback(err,null);
                else{
                    if(vendor.length >0)
                        callback(null,vendor[0]);
                    else
                        callback(null,null);
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

        },
        getAllCategories:function(callback){

            var query = "select id,name from category where status = 'active'";
            mysql_connect.query(query,function(err,categories){

                if(err)
                    callback(err,null);
                else
                    callback(null,categories);

            });

        },
        getAllAmenities:function(callback){

            var query = "select id,name from amenities";
            mysql_connect.query(query,function(err,amenities){

                if(err)
                    callback(err,null);
                else
                    callback(null,amenities);

            });
        },
        getAllSubtypes: function(callback){

            var query = "select id,name,category from subtypes where status='active'";
            mysql_connect.query(query,function(err,amenities){

                if(err)
                    callback(err,null);
                else

                    callback(null,amenities);

            });

        },newCounty : function(name,short,callback){


            var query ='select id from country where name=?';
            mysql_connect.query(query,[name],function(err,country){

                if(err)
                    callback(err,null);
                else if(country.length >0){
                    callback(null,country[0].id);

                }else{

                    var query = 'insert into country (name,short) values("'+name+'","'+short+'")';
                    mysql_connect.query(query,function(err,success){
                        if(err)
                            callback(err,null);
                        else{
                            callback(null,success.insertId);
                        }
                    });
                }

            });
        },
        newState:function(name,short,country,callback){

            var query ='select id from states where name=? and country_id=?';
            mysql_connect.query(query,[name,country],function(err,state){

                if(err)
                    callback(err,null);
                else if(state.length >0){

                    callback(null,state[0].id);

                }else{

                    var query = 'insert into states (name,short,country_id) values("'+name+'","'+short+'","'+country+'")';
                    mysql_connect.query(query,function(err,success){
                        if(err)
                            callback(err,null);
                        else{
                            callback(null,success.insertId);
                        }
                    });
                }

            });

        },
        newCity : function (name,id,state_id,callback){

            var query ='select id from cities where name=? and country_id=?';
            mysql_connect.query(query,[name,id],function(err,city){

                if(err)
                    callback(err,null);
                else if(city.length > 0){
                    callback(null,city[0].id);

                }else{

                    var query = 'insert into cities (name,country_id,state_id,created_date,status) values("'+name+'","'+id+'","'+state_id+'",NOW(),"active")';
                    mysql_connect.query(query,function(err,success){
                        if(err)
                            callback(err,null);
                        else{
                            callback(null,success.insertId);
                        }
                    });
                }

            });
        },

        checkGraphNode:function(vendor_id,callback){

            var query = 'select * from vendor_meta where vendor_id=? and key_name="grap_node_id"';
            mysql_connect.query(query,[vendor_id],function(err,nodeId){
                if(err)
                    callback(err);
                else{
                    callback(null,nodeId[0].key_value);
                }
            })

        },
        createTransaction : function(vendor,listing,amount,type,callback){

            var query = 'insert into recharge (vendor_id,listing_id,amount,payment_type,status) values("'+vendor+'","'+listing+'","'+amount+'","'+type+'","pending")';
            mysql_connect.query(query,function(err,status){

                if(err)
                    callback(err,null);
                else
                    callback(null,status.insertId);
            });
        },
        checkAccountActive :function(vendor,callback){

            var query = 'select id from vendors where id = ? and status = "active"';
            mysql_connect.query(query,[vendor],function(err,status){

                if(err)
                    callback(err,null);
                else{

                    if(status.length > 0){
                        callback(null,true);
                    }else{
                        callback(null,false);
                    }
                }

            });
        }



    };
};
