var express=require('express');
var router=express.Router();

var vendor=require('./vendor.js');
var listing = require('./listing.js');
var request = require('./request.js');
var booking  = require('./booking.js');
//var payment = require('./payment.js');

/* all vendor related routes */


router.get('/vendor/config',vendor.config);
router.post('/vendor/login',vendor.login);
router.post('/vendor/addgcmtoken',vendor.addGCMToken);
router.post('/vendor/new',vendor.createVendor);
router.get('/vendor/balance',vendor.getBalance);
router.get('/vendor/samplegcm',vendor.samplegcm);
router.post('/vendor/forgot-password',vendor.forgotPassword);
router.post('/vendor/change-password',vendor.changePassword);


//router.post('/vendor/listing/new',listing.createListing);
router.post('/vendor/listing/new',listing.newListing);
router.get('/vendor/listing/getlisting',listing.getListingDetails);



router.get('/vendor/new-requests',request.getNewrequests);
router.get('/vendor/replied-requests',request.repliedRequests);
router.get('/vendor/getrequest',request.getRequestDetails);


router.post('/vendor/new-price',request.newPrice);
//router.post('/vendor/init-recharge',payment.initRecharge);


router.get('/vendor/confimed-bookings',booking.confirmedBookings);
router.get('/vendor/getbooking',booking.getBookingDetails);



//router.get('/vendor/balace',vendor.getBalance);
//router.get('/vendor/logout',vendor.logout);


module.exports = router;