var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'pricepls',
    api_key: '287145665136215',
    api_secret: 'Kfl99Unbk9CQKMf-kp6twk9DqeQ'
});
//var multer  = require('multer');
var fs = require('fs');
var mysqlDB=require('../lib/mysqldb')();
mysqlDB.init();

var util = {

    uploadTocloudanary : function(image,publicId,callback){

        cloudinary.uploader.upload(image,function(result) {
            console.log(result)
            callback(result);
        },{public_id:publicId});
    },
    uploadImage :function(req,res,next){

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
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
            });
        });

    },
    checkGraphNodeExits:function(vendor_id,listing_id){

        mysqlDB.checkGraphNode(vendor_id,function(err,status){


        });

    }


}

module.exports = util;