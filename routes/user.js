const userController=require('../controller/user')

const isLogin=require('../middleware/is-login')

const {body}=require('express-validator')

const User=require("../models/user")

const express=require('express')
const session = require('express-session')

const router=express.Router();

router.get('/',userController.getIndex) 
router.get('/index-json',userController.getIndexjson) 

router.get('/add-blog',isLogin.isLogin,userController.getAddBlog) 
router.get('/add-blog-json',isLogin.isLoginJson,userController.getAddBlogJson) 

router.post('/add-blog',[],isLogin.isLogin,userController.postAddBlog) 

router.post('/add-blog-json',isLogin.isLoginJson,[
    body('title','Title can not be Empty').isLength({min:1}).trim(),
    body('content','Blog description greater than 5 word').isLength({min:5}).trim()
],userController.postAddBlogJson)  
 


router.get('/my-blog',isLogin.isLogin,userController.getMyBlog)
router.get('/my-blog-json',isLogin.isLoginJson,userController.getMyBlogJson)
router.get('/my-details-json',isLogin.isLoginJson,userController.getMyDetailsJson)


router.get('/edit-blog/:blogId',isLogin.isLogin,userController.getEditBlog) 
router.get('/edit-blog-json/:blogId',isLogin.isLoginJson,userController.getEditBlogJson) 
 

router.post('/edit-blog/:blogId',isLogin.isLogin,userController.postEditBlog)
router.patch('/edit-blog-json/:blogId',isLogin.isLoginJson,[
    body('title','Title can not be Empty').isLength({min:1}).trim(),
    body('content','Blog description greater than 5 word').isLength({min:5}).trim()
],userController.postEditBlogJson)


router.post('/delete-blog/:blogId',isLogin.isLogin,userController.postDeleteBlog) 
router.delete('/delete-blog-json/:blogId',isLogin.isLoginJson,userController.postDeleteBlogJson) 


router.post('/add-comment/:blogId',isLogin.isLogin, userController.postAddComment) 
router.post('/add-comment-json/:blogId',isLogin.isLoginJson,[
    body('commentContent',"Comment can't empty").isLength({min:1}).trim()
], userController.postAddCommentJson) 

router.get('/view-comment/:blogId',isLogin.isLogin,userController.getViewComment)
router.get('/view-comment-json/:blogId',isLogin.isLoginJson,userController.getViewCommentJson)

router.post('/like/:blogId',isLogin.isLogin, userController.postLike) 
router.post('/like-json/:blogId',isLogin.isLoginJson, userController.postLikeJson) 


router.get('/edit-profile',isLogin.isLogin,userController.getEditProfile)  

router.get('/edit-profile-json',isLogin.isLoginJson,userController.getEditProfileJson) 





router.post('/edit-profile',isLogin.isLogin,[
    body('phone', "Enter Valid Number")
    .custom(async (phone, { req }) => {
      const userId = req.session.user._id; // current logged-in user
      const usedNumberUser = await User.findOne({ phone });
  
      if (usedNumberUser && usedNumberUser._id.toString() !== userId.toString()) {
        throw new Error('Number is already registered');
      }
      return true;
    })
    .isLength({ min: 10, max: 10 })
    .matches(/^[6-9]\d{9}$/)
    ],userController.postEditProfile) 


router.patch('/edit-profile-json', isLogin.isLoginJson, [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone')
      .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits")
      .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid mobile number")
      .custom(async (phone, { req }) => {
        console.log('phone', req.body)
        const userId = req.user._id;
        const usedNumberUser = await User.findOne({ phone });
  
        if (usedNumberUser && usedNumberUser._id.toString() !== userId.toString()) {
          throw new Error('Number is already registered');
        }
        return true;
      }),
      body('dob','Enter valid DOB').isLength({min:1}).custom(  (dob)=>{
                const dobDate = new Date(dob);
                const today = new Date();
                if (dobDate >= today) {
                    throw new Error('Date of Birth must be less than current date');
                }  
               return true; 
            }),
          
  ], userController.postEditProfileJson);
  
module.exports=router