const express=require('express')
const router=express.Router();
const adminController=require('../controller/admin')


const isAdmin=require('../middleware/is-admin')


  
router.get('/admin/index',isAdmin.isAdmin,adminController.getIndex) 
router.get('/admin/index-json',isAdmin.isAdminJson,adminController.getIndexJson) 

router.get('/admin/all-blog',isAdmin.isAdmin,adminController.getAllBlog) 
router.get('/admin/all-blog-json',isAdmin.isAdminJson,adminController.getAllBlogJson) 


router.get('/admin/view-comment/:blogId',isAdmin.isAdmin,adminController.getViewComment) 
router.get('/admin/view-comment-json/:blogId',isAdmin.isAdminJson,adminController.getViewCommentJson) 


router.get('/admin/user-details',isAdmin.isAdmin,adminController.getUserDetails)  
router.get('/admin/user-details-json',isAdmin.isAdminJson,adminController.getUserDetailsJson) 


router.get('/admin/manage-blog/:userId',isAdmin.isAdmin,adminController.getManageBlog) 
router.get('/admin/manage-blog-json/:userId',isAdmin.isAdminJson,adminController.getManageBlogJson) 

router.post('/admin/delete-blog/:blogId',isAdmin.isAdmin,adminController.postDeleteBlog) 
router.delete('/admin/delete-blog-json/:blogId',isAdmin.isAdminJson,adminController.postDeleteBlogJson) 



router.post('/admin/disable-blog/:blogId',isAdmin.isAdmin,adminController.postDisableBlog) 
router.patch('/admin/disable-blog-json/:blogId',isAdmin.isAdmin,adminController.postDisableBlogJson) 

router.post('/admin/enable-blog/:blogId',isAdmin.isAdmin,adminController.postEnableBlog) 
router.patch('/admin/enable-blog-json/:blogId',isAdmin.isAdmin,adminController.postEnableBlogJson) 


router.post('/admin/delete-user/:userId',isAdmin.isAdmin,adminController.postDeleteUser) /
router.delete('/admin/delete-user-json/:userId',isAdmin.isAdminJson,adminController.postDeleteUserJson) 

router.post('/admin/toggle-user/:userId',isAdmin.isAdmin,adminController.postToggleUser)
router.patch('/admin/toggle-user-json/:userId',isAdmin.isAdmin,adminController.postToggleUserJson)

module.exports=router
  