"use strict"

var neo = require('neo4j');
var configs = app.get('configs');
var server = configs.neo.server;
var port = configs.neo.port;


var db = new neo('http://neo:aJAORbpsUj4r@54.255.196.214:7474');



var neojs = {

    connnect : function(){



    }

}

module.exports = neojs;