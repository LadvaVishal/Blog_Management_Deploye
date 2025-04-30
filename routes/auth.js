const authController=require('../controller/auth')

const User=require("../models/user")

const Admin=require('../models/admin')

const {body}=require('express-validator')

const express=require('express')

const router=express.Router();
   
router.get('/signup',authController.getSignup) 
router.get('/signup-json',authController.getSignupJson) 


router.post('/signup',[              
    body('email','Enter Valid Email').isEmail().normalizeEmail()
    .custom( async (value) => {
        const usedEmail = await User.findOne({ email:value }).select('-password') ;
            if (usedEmail) {
                throw new Error('Email is already registered');
            }
      }),
    body('phone',"Enter Valid Number")
    .custom( async (phone) => {
        const usedNumber = await User.findOne({ phone: phone }).select('-password') ;
            if (usedNumber) {
                throw new Error('Number is already registered');
            }
      }).isLength({min: 10, max:10}).matches(/^[6-9]\d{9}$/) 
    ],authController.postSignup)


router.post('/signup-json',[   
    body('email','Enter Valid Email').isEmail().normalizeEmail()
    .custom( async (value) => {
        const usedEmail = await User.findOne({ email:value });
            if (usedEmail) {
                throw new Error('Email is already registered');
            }
      }),
    body('phone',"Enter Valid Number")
    .custom( async (phone) => {
        const usedNumber = await User.findOne({ phone: phone });
            if (usedNumber) {
                throw new Error('Number is already registered');
            }
      }).isLength({min: 10, max:10}).matches(/^[6-9]\d{9}$/), 
      body('dob','Enter valid DOB').isLength({min:1}).custom(  (dob)=>{
          const dobDate = new Date(dob);
          const today = new Date();
          if (dobDate >= today) {
              throw new Error('Date of Birth must be less than current date');
          }  
         return true; 
      }),
    body('password','Enter Valid Password').isLength({min:5}).isAlphanumeric().trim(),
    body('confirm-password','password not matched').custom((cnfpass, {req}) => cnfpass === req.body.password)
    ],authController.postSignupjson)



router.get('/login',authController.getLogin)
router.get('/login-json',authController.getLoginJson)


router.post('/login',     
    // [ body('email','Enter Valid Email').isEmail().normalizeEmail(),
    // body('password','Enter Valid Password').isLength({min:5}).trim()],
    authController.postLogin)

router.post('/login-json',authController.postLoginJson)



router.get('/verify-email/:token', authController.verifyEmail);
router.get('/verify-email-json/:token', authController.verifyEmailJson);


router.get('/forgot-password',authController.getForgotPassword)
router.get('/forgot-password-json',authController.getForgotPasswordJson) //


router.post('/forgot-password',authController.postForgotPassword) 
router.post('/forgot-password-json',authController.postForgotPasswordJson) 


router.get('/reset-password/:token', authController.getNewPassword); 
router.get('/reset-password-json/:token', authController.getNewPasswordJson);


router.post('/reset-password/:token', authController.postNewPassword);
router.post('/reset-password-json/:token', authController.postNewPasswordJson);

router.post('/user-logout',authController.postUserLogout)
router.post('/user-logout-json',authController.postUserLogoutJson)


router.get('/admin-signup',authController.getAdminSignup) 
router.get('/admin-signup-json',authController.getAdminSignupJson) 


router.post('/admin-signup',[    
    body('email','Enter Valid Email').isEmail().normalizeEmail()
    .custom( async (value) => {
        const usedEmail = await Admin.findOne({ email:value });
            if (usedEmail) {
                throw new Error('Email is already registered');
            }
      }),
    body('phone',"Enter Valid Number")
    .custom( async (phone) => {
        const usedNumber = await Admin.findOne({ phone: phone });
            if (usedNumber) {
                throw new Error('Number is already registered');
            }
      }).isLength({min: 10, max:10}).matches(/^[6-9]\d{9}$/)
    // body('password','Enter Valid Password').isLength({min:5}).isAlphanumeric().trim(),
    // body('confirm-password','password not matched').custom((cnfpass, {req}) => cnfpass === req.body.password)
    ],authController.postAdminSignup)


router.post('/admin-signup-json',[    
    body('email','Enter Valid Email').isEmail().normalizeEmail()
    .custom( async (value) => {
        const usedEmail = await Admin.findOne({ email:value });
            if (usedEmail) {
                throw new Error('Email is already registered');
            }
        }),
    body('phone',"Enter Valid Number")
    .custom( async (phone) => {
        const usedNumber = await Admin.findOne({ phone: phone });
            if (usedNumber) {
                throw new Error('Number is already registered');
            }
        }).isLength({min: 10, max:10}).matches(/^[6-9]\d{9}$/),
    body('password','Enter Valid Password').isLength({min:5}).isAlphanumeric().trim(),
    body('confirm-password','password not matched').custom((cnfpass, {req}) => cnfpass === req.body.password)
    ],authController.postAdminSignupJson)


router.get('/admin-login',authController.getAdminLogin) 
router.get('/admin-login-json',authController.getAdminLoginJson) 

router.post('/admin-login',authController.postAdminLogin) 
router.post('/admin-login-json',authController.postAdminLoginJson) 


router.post('/admin-logout',authController.postAdminLogout)
router.post('/admin-logout-json',authController.postAdminLogoutJson)
module.exports=router