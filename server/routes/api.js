
var express 	= require('express');
var router 		= express.Router();

var jwtAuth 	= require('../jwtAuth');
var config 		= require('../config/config');

var userCtrl 	= require('../controller/userController');
var postjobCtrl = require('../controller/postjobController');
var homeCtrl 	= require('../controller/homeController');
var bookingCtrl = require('../controller/bookingController');
var contactCtrl = require('../controller/conatctUsController');
var chatCtrl 	= require('../controller/chatController');
var adminCtrl 	= require('../controller/adminController');

//User Routes
router.post('/token-verify',userCtrl.verifyToken);
router.post('/user/register',userCtrl.register);
router.post('/user/login',userCtrl.login);
router.post('/user/get',userCtrl.getUser);
router.get('/user/profile',jwtAuth.verifyToken,userCtrl.profile);
router.post('/user/update',jwtAuth.verifyToken,userCtrl.update);
router.post('/user/getUserdetails',jwtAuth.verifyToken,userCtrl.getUserdetails);
router.post('/user/forgotpassword',userCtrl.forgotPassword);
router.post('/user/resetpassword',userCtrl.resetPassword);

router.post('/user/timesheet/store',jwtAuth.verifyToken,userCtrl.storeUserTimeStore);
router.post('/user/timesheet/get',jwtAuth.verifyToken,userCtrl.getUserTimeStore);
router.post('/user/timesheet/getbyid',userCtrl.getUserTimeSheetbyId);
router.post('/user/timesheet/custom',userCtrl.getUserTimeSheetHour);

router.post('/user/isEmailUnique',userCtrl.isEmailExist);
router.get('/user/aboutme/get',jwtAuth.verifyToken,userCtrl.getAboutMe);
router.post('/user/aboutme/save',jwtAuth.verifyToken,userCtrl.saveAboutMe);


router.post('/user/document/delete',jwtAuth.verifyToken,userCtrl.deleteDocument);

router.post('/user/review/get',userCtrl.getUserReview);
router.post('/user/review/store',jwtAuth.verifyToken,userCtrl.storeUserReview);

//Job Routes
router.post('/job/createjob',postjobCtrl.createjob);
router.post('/job/postjob',jwtAuth.verifyToken,postjobCtrl.postjob);


//Booking Routes
router.post('/storeUserHireDay',bookingCtrl.storeUserHireDay);
router.post('/booking/store',jwtAuth.verifyToken,bookingCtrl.storeBooking);
router.post('/booking/message/store',jwtAuth.verifyToken,bookingCtrl.storeBookingMessage);
router.post('/stripePayment',jwtAuth.verifyToken,bookingCtrl.stripePayment);


//Home Route
router.post('/home', homeCtrl.userData);
router.post('/home/search', homeCtrl.search);
router.post('/home/filter', homeCtrl.filter);

router.post('/subscribe', userCtrl.subcribe);

router.post('/contactus',contactCtrl.conatctUs);
router.post('/sendMail',contactCtrl.sendMail);


router.post('/chat/getusers',jwtAuth.verifyToken,chatCtrl.getUsers);
router.post('/chat/getuserchat',jwtAuth.verifyToken,chatCtrl.getUserChat);

/*
router.post('/admin/login',adminCtrl.login);
router.post('/admin/dashboard',jwtAuth.verifyToken,adminCtrl.dashboard);
router.post('/admin/userdetailsbyid',jwtAuth.verifyToken,adminCtrl.getUserDetailsById);
router.post('/admin/userlistbytype',jwtAuth.verifyToken,adminCtrl.getUserListByType);*/


router.post('/admin/login',adminCtrl.login);
router.get('/admin/dashboard',adminCtrl.dashboard);
router.post('/admin/userdetailsbyid',adminCtrl.getUserDetailsById);
router.post('/admin/userlistbytype',adminCtrl.getUserListByType);
router.post('/admin/deleteUser',adminCtrl.deleteUserById);

router.get('/admin/quickjoblist',adminCtrl.getQuickJobList);
router.post('/admin/deletequickjob',adminCtrl.deleteQuickJobById);
router.post('/admin/quickjobdetailbyid',adminCtrl.getQuickJobDetailById);


/* Blog */
router.get('/admin/bloglist',adminCtrl.getBlogList);
router.post('/admin/deleteblog',adminCtrl.deleteBlogById);
router.post('/admin/storeblog',adminCtrl.storeBlog);

router.post('/admin/getblogdetailbyid',adminCtrl.getBlogDetailsById);
router.post('/admin/updateblog',adminCtrl.updateBlog);
router.get('/admin/transactionhistroy',adminCtrl.getTransactionHistroy);
router.post('/admin/changetransactionstatus',adminCtrl.changeTransactionStatus);
router.post('/admin/gettotalpayementbydate',adminCtrl.getTotalPayementByDate);
router.post('/admin/gettransactionbydate',adminCtrl.getTransactionByDate);
router.post('/admin/updateuserstatus',adminCtrl.updateUserStatus);

router.get('/blog',adminCtrl.getLatestBlog);
router.get('/getallblog',adminCtrl.getAllBlog);
router.post('/getblogbyid',adminCtrl.getBlogById);
router.post('/user/useralldetails',jwtAuth.verifyToken,userCtrl.getUserAllDetails);
router.get('/user/checkuserjobpost',jwtAuth.verifyToken,userCtrl.checkUserJobPost);

router.post('/user/storemessagebyjobid',postjobCtrl.storeMessageByJobId);

router.post('/user/getuserdetailsbyjobid',jwtAuth.verifyToken,postjobCtrl.getUserDetailsByJobId);
router.post('/adduserchat',jwtAuth.verifyToken,userCtrl.addUserChat);
router.post('/getjobdetailsbyid',postjobCtrl.getJobDetailsById);
router.post('/user/sociallogin',userCtrl.socialLogin);
router.post('/user/sendmessagepostjobuser',jwtAuth.verifyToken,postjobCtrl.sendMessagePostJobUser);
router.post('/getAllLocation', homeCtrl.getAllLocation);
router.post('/admin/updateprofilebyid', adminCtrl.updateProfileById);
router.post('/admin/addnewuser', adminCtrl.addNewUser);
//router.post('/admin/userdetails', homeCtrl.userDetails);
module.exports = router;

