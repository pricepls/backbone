//var express= require('express');
var request = require('request');


var reqLib = {

    makeGetRequest : function(url,data,callback){
        if(data == null || data === undefined){
            data='';
        }
        request({
            url: url, //URL to hit
            qs: data,
            method: 'GET',
            headers: {
                'Content-Type':'application/x-www-form-urlencoded'
            }
        }, function(error, response, body){
            if(error) {
                callback(error,null);
            } else {
                callback(null, body);
            }
        });



    },
    makePostRequest : function(url,data,callback){

        request({
            url: 'http://'+url, //URL to hit
            method: 'POST',
            headers: {
                'Content-Type':'application/x-www-form-urlencoded'
            },
            body:data
        }, function(error, response, body){
            if(error) {
                callback(error,null);
            } else {
                callback(null,body);
            }
        });

    },
    makeSimpleGetRequest:function(url,callback){

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null,body);
            }else{
                callback(error,null);
            }
        })

    }

}

module.exports = reqLib;