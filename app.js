if(process.env.ENVIORNMENT!='development')
    require('newrelic');
var express=require('express'),
    bodyParser=require('body-parser'),
    logger=require('morgan');

app=express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


// error handlers

// development error handler
// will print stacktrace

var configFile=require('./config.json');
var configs;

// reading config based on env
if(process.env.ENVIORNMENT =='development'){

    app.use(logger('short'));
    configs=configFile.development;

}else{

    app.use(logger('short'));
    configs=configFile.production;

}
// setting the config to make it available everywhere
app.set('configs',configs);

// loading constants

var constants=require('./constants.json');
app.set('constants',constants);

var port=configs.port;

// router files

var router=require('./routes');
app.use('/',router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            status:'error',
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        status:'error',
        message: err.message,
        error: {}
    });
});



app.listen(port,function(){

    console.log("price pls back-bone started");

});
