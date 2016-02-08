var lwip = require('lwip');
var path = require('path');
var utils = require('./util.js');

var crop = {

    changeImage :function(file_name,name,extension,listindNumber,callback){

        var file_path = path.join(__dirname,'../s3_files/'+file_name);
        var destination_file = path.join(__dirname,'../cropped_images/'+file_name);
        logger.log("debug","file path "+file_path);

        var images = {

        }
        lwip.open(file_path, function(err, image) {
            if (!err) {
                image.resize(150, 150, function (err, rzdImg) {
                    rzdImg.writeFile(destination_file, function (err) {
                        if (!err){
                            utils.uploadToS3(destination_file,{originalname:name+'_150_150.'+extension},listindNumber+'/cropped',function(err,data){

                                images.booking_details_url = data.Location;
                                lwip.open(file_path, function(err, image) {
                                    if (!err) {
                                        image.resize(400, 250, function (err, rzdImg) {
                                            rzdImg.writeFile(destination_file, function (err) {
                                                if (!err){
                                                    utils.uploadToS3(destination_file,{originalname:name+'_400_250.'+extension},listindNumber+'/cropped',function(err,data){
                                                        images.request_list_url = data.Location;
                                                        logger.info("image cropped and uploaded ",JSON.stringify(images));
                                                        var fs = require('fs');
                                                        fs.unlinkSync(file_path);
                                                        fs.unlinkSync(destination_file);
                                                        callback(images)
                                                    })
                                                }
                                            });
                                        });
                                    }
                                });


                            })
                        }
                    });
                });
            }else{
                logger.error("error while cropping ",err);
            }
        });

    }
}

module.exports = crop;

