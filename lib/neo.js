"use strict"

var neo4j = require('neo4j');
var configs = app.get('configs');
var user = configs.neo.user;
var password = configs.neo.password;
var server = configs.neo.server;
var port = configs.neo.port;
var neo4j_server = 'http://'+user+':'+password+'@'+server+':'+port;
var db = new neo4j.GraphDatabase(neo4j_server);
var neojs = {



}

module.exports = neojs;