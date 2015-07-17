var express=require('express');
var router=express.Router();

var admin=require('./admin.js');
var vendor=require('./vendor.js');

router.get('/admin/',admin.check);
router.post('/admin/login',admin.login);
router.post('/admin/new',admin.createAdmin);

/* all vendor related routes */

router.post('/vendor/login',vendor.login);
router.post('/vendor/new',vendor.createVendor);
router.post('/vendor/listing/new',vendor.createListing);
router.post('/vendor/new-price',vendor.newPrice);
router.get('/vendor/new-requests',vendor.getNewrequests);
router.get('/vendor/replied-requests',vendor.repliedRequests);
router.get('/vendor/confimed-bookings',vendor.confirmedBookings);
//router.get('/vendor/balace',vendor.getBalance);
//router.get('/vendor/logout',vendor.logout);


module.exports = router;