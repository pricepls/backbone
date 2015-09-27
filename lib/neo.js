"use strict"

//var neo4j = require('neo4j');
var configs = app.get('configs');
var user = configs.neo.user;
var password = configs.neo.password;
var server = configs.neo.server;
var port = configs.neo.port;
var neo4j_server = 'http://'+user+':'+password+'@'+server+':'+port;
//var db = new neo4j.GraphDatabase(neo4j_server);
var neo4j = require('node-neo4j');
var db = new neo4j(neo4j_server);

console.log(db);


var neojs = {

    createNode : function(data,callback){

        db.insertNode(data,function(err, node){
            if(err) {
                callback(err, null);
            }else{
                callback(null,node);
            }
        });
    }


}

module.exports = neojs;