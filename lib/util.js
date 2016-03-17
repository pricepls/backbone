var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'pricepls',
    api_key: '287145665136215',
    api_secret: 'Kfl99Unbk9CQKMf-kp6twk9DqeQ'
});

var s3_key_id = "AKIAITBZK2MKHOYDZY4Q";
var s3_key = "n5PdKny+tDuoDXbC0I9QLXCe/EjuzrJ8gHofYEYQ";

var lwip = require('lwip');
var s3 = require('s3');

var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: "AKIAITBZK2MKHOYDZY4Q",
        secretAccessKey: "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"
    },
});
logger.log("debug", JSON.stringify(s3));


var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'AKIAITBZK2MKHOYDZY4Q', secretAccessKey: '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'});
AWS.config.update({region: 'ap-southeast-1'});
var s3 = new AWS.S3();


//var multer  = require('multer');
var fs = require('fs');
var mysqlDB = require('../lib/mysqldb')();
mysqlDB.init();

var mongodb = require('./mongodb');

var util = {

    uploadTocloudanary: function (image, publicId, callback) {

        cloudinary.uploader.upload(image, function (result) {
            //console.log(result)
            result.appshow_url = cloudinary.url('v' + result.version + '/' + result.public_id + '.' + result.format, {
                width: 200,
                crop: "scale"
            });
            callback(result);

        }, {public_id: publicId});
    },
    createCloundinaryImages: function (image_url, callback) {

        var image_url = image_url.split('upload/');
        var request_list_url = cloudinary.url(image_url[1], {width: 400, height: 250, crop: 'thumb'});
        var booking_details_url = cloudinary.url(image_url[1], {width: 150, height: 150, crop: 'thumb'});
        callback({'request_list_url': request_list_url, 'booking_details_url': booking_details_url});

    },
    uploadImage: function (req, res, next) {

        //multer({ dest: 'uploads/',
        //    rename: function (fieldname, filename) {
        //        return filename;
        //    },
        //    onFileUploadStart: function (file) {
        //        console.log(file.originalname + ' is starting ...')
        //    },
        //    onFileUploadComplete: function (file) {
        //        console.log(file.fieldname + ' uploaded to  ' + file.path)
        //        next();
        //    }
        //});

        var tmp_path = req.files.thumbnail.path;
        // set where the file should actually exists - in this case it is in the "images" directory
        var target_path = './public/images/' + req.files.thumbnail.name;
        // move the file from the temporary location to the intended location
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
            fs.unlink(tmp_path, function () {
                if (err) throw err;
                res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
            });
        });

    },
    checkGraphNodeExits: function (vendor_id, listing_id) {

        mysqlDB.checkGraphNode(vendor_id, function (err, status) {


        });

    },
    getNextSequenceNumber: function (name, callback) {

        mongodb.getLastNumber(name, function (err, next) {
            if (err)
                callback(err, nul);
            else
                callback(null, next);
        })

    },
    uploadToS3uploadToS3: function (path, image, publicId, callback) {

        var BUCKET_NAME = 'listing.images/'+publicId;
        var fileBuffer = fs.readFileSync(path);
        var metaData = this.getContentTypeByFile(image.originalname);

        s3.upload({
            ACL: 'public-read',
            Bucket: BUCKET_NAME,
            Key: image.originalname,
            Body: fileBuffer,
            ContentType: metaData
        }, function (error, response) {

            if(error)
                callback(err);
            else{
                callback(null,response);
            }

        });


    },
    getContentTypeByFile: function (fileName) {
        var rc = 'application/octet-stream';
        var fn = fileName.toLowerCase();

        if (fn.indexOf('.html') >= 0) rc = 'text/html';
        else if (fn.indexOf('.css') >= 0) rc = 'text/css';
        else if (fn.indexOf('.json') >= 0) rc = 'application/json';
        else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
        else if (fn.indexOf('.png') >= 0) rc = 'image/png';
        else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

        return rc;
    },
    cropImage :function(file,callback){

        require('lwip').open("picture_not_available.png", function(err, image){

            if(err){

                throw err;
            }
            // check err...
            // define a batch of manipulations and save to disk as JPEG:
            image.batch()
                .scale(0.75)          // scale to 75%
                .crop(200, 200)       // crop a 200X200 square from center
                .writeFile('cropped/'+image_or.originalname, function(err){
                    callback();
                });

        });
    },
    downloadS3File: function(bucket,key,localfile,callback){

        logger.log("debug","bucket "+bucket+" key "+key+" localfile "+localfile);

        try{

            var http = require('https');
            var fs = require('fs');

            var file = fs.createWriteStream(localfile);
            var request = http.get(key, function(response) {
                response.pipe(file);
                callback();
            });
        }catch(e){

            logger.error("error while downloading image "+e);
        }


    }




}

module.exports = util;