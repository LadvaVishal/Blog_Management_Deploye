const Blog=require('../models/blog')
const User=require('../models/user')
const {validationResult}=require('express-validator')
const Comment=require('../models/comment')
const deleteImage=require('../util/delete-image')


exports.getIndex = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        let limit=req.query.limit || 3
        let ITEMS_PER_PAGE=limit;

        const totalItems = await Blog.countDocuments({ flag: true });
        if(limit==0){
            ITEMS_PER_PAGE=totalItems
        }

        const blogs = await Blog.find({ flag: true })
            .populate('userReference', '_id name imageUrl isVerified flag ') // Select specific fields
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('user/index', {
            blog: blogs, 
            isLoggedIn: req.session.isLoggedIn,
            userId: req.session.isLoggedIn ? req.session.user._id : '',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            limit

        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.getIndexjson = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=req.query.limit || 3;
        let ITEMS_PER_PAGE=limit;

        const totalItems = await Blog.countDocuments({ flag: true });

        if(limit==0){
            ITEMS_PER_PAGE=totalItems
        }

        const blogs = await Blog.find({ flag: true })
            .populate('userReference', '_id name imageUrl isVerified flag ') // Select specific fields
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.json({
            blogs,
            isLoggedIn: !!req.user, 
            userId: req.user ? req.user._id : '',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            limit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.getAddBlog=async(req,res)=>{
    const userReference = req.session.user._id;
    const user = await User.findById(userReference).select('-password')

    res.render('user/add-blog',{
                errorMessage:'', 
                user,
                oldInput: {},
                validationError:[]
    })
}

exports.getAddBlogJson=(req,res)=>{
    res.json({
        success:true,
        message:'Add New Blog Page!!', 
    })
}


exports.postAddBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userReference = req.session.user._id;
        const image = req.file;

        if (!image) {
            return res.render('user/add-blog', {
                errorMessage: "Please upload an image",
                oldInput: { title, content },
                validationError: [],
            });
        }

        const blog = new Blog({
            title,
            content,
            userReference,
            imageUrl: image.path,
        });

        await blog.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};


exports.postAddBlogJson = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userReference = req.user._id;
        const image = req.file;
        const errors = validationResult(req);
 
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: { title, content },
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
                oldInput: { title, content }
            });
        }

        const blog = new Blog({
            title,
            content,
            userReference,
            imageUrl: image.path,
        });

        await blog.save();

        return res.status(201).json({
            success: true,
            message: "Blog added successfully",
            blog
        });

    } catch (err) {
        console.error("Error adding blog:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


exports.getMyBlog = async (req, res) => {
    try {
        const loginUserId = req.session.user._id;
        const page = +req.query.page || 1;

        let limit=req.query.limit || 3
        let ITEMS_PER_PAGE=limit;

        const user= await User.findById(loginUserId).select('-password')

        const totalItems = await Blog.countDocuments({ userReference: loginUserId }); // total number of blogs
 
        if(limit==0){
            ITEMS_PER_PAGE=totalItems
        }
        const blogs = await Blog.find({ userReference: loginUserId })
            // .populate('userReference')
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('user/my-blog', {
            user,
            blog: blogs,
            isLoggedIn: req.session.isLoggedIn,
            userId: loginUserId,
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / ITEMS_PER_PAGE),
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            limit

        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.getMyBlogJson = async (req, res) => {
    try {
        const loginUserId = req.user._id;
        const page = +req.query.page || 1;
        let limit=req.query.limit || 3

        let ITEMS_PER_PAGE=limit;
        
        const totalItems = await Blog.countDocuments({ userReference: loginUserId }); // total number of blogs
        if(limit==0){
            ITEMS_PER_PAGE=totalItems
        }
        const blogs = await Blog.find({ userReference: loginUserId })
            // .populate('userReference')
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.json( {
            // user,
            blog: blogs,
            isLoggedIn: !!req.user,
            userId: loginUserId,
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / ITEMS_PER_PAGE),
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json( {success:false , Message: "Internal Server Error"});

    }
};


exports.getMyDetailsJson = async (req, res) => {
    try {
        res.json( {
            user:req.user,
            isLoggedIn: !!req.user,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json( {success:false , Message: "Internal Server Error"});

    }
};


exports.getEditBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);

        const user=req.user;
        if (user._id.toString() !== blog.userReference.toString()) {
            console.log("you are not vald user")
            return res.redirect('/')   
        }

        if (!blog) {
            console.log("No blog found");
            return res.status(404).render('user/edit-blog', {
                errorMessage: "Blog not found",
                validationError: [],
                blog: null
            });
        }

        res.render('user/edit-blog', {
            errorMessage: '',  
            validationError: [], 
            blog
        });

    } catch (err) {
        console.error(err);
        res.status(500).json( {success:false , Message: "Internal Server Error"});
    }
};


exports.getEditBlogJson = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);

        if (!blog) {
            console.log("No blog found");
            return res.status(404).json( {
                message: "Blog not found"
            });
        }

        const user=req.user;
        if (user._id.toString() !== blog.userReference.toString()) {
            console.log("you are not vald user")
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this blog"
            }); 
        }
        res.json( {
            success:true,
            blog
        });

    } catch (err) {
        console.error(err);
        res.status(500).json( {success:false , Message: "Internal Server Error"});
    }
};


exports.postEditBlog = async (req, res) => {
     const blogId = req.params.blogId;

    const { title: updatedTitle, content: updatedContent } = req.body;

    const image = req.file;

    try {
        let updatedBlog;

        if (image) {
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $set: {
                        title: updatedTitle,
                        content: updatedContent,
                        imageUrl: image.path
                    }
                },
                { new: true }
            );
        } else {
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $set: {
                        title: updatedTitle,
                        content: updatedContent
                    }
                },
                { new: true }
            );
        }

        res.redirect('/my-blog');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.postEditBlogJson = async (req, res) => {
 
    const blogId = req.params.blogId;
    const { title, content } = req.body;

    const image = req.file;

    try {
        let updatedBlog;

        if (image) {
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $set: {
                        title,
                        content,
                        imageUrl: image.path
                    }
                },
                { new: true }
            );
        } 
        else {
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $set: { title , content}
                },
                { new: true }
            );
        }

        res.json({
            success:true,
            updatedBlog
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.postDeleteBlog=async(req,res)=>{
    try{
        const blogId = req.params.blogId;
        console.log("post delete blog=>>",blogId)
  
        const deletedBlog = await Blog.findByIdAndDelete(blogId);
                 
        onsole.log("delete blog", deletedBlog)
    
            if (!deletedBlog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            }
            const imageUrl = deletedBlog.imageUrl; 
    
            await Comment.deleteMany({ blogReference: blogId });
    
            if (imageUrl) {
                deleteImage(imageUrl);
            }
        res.redirect('/my-blog')
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.postDeleteBlogJson=async(req,res)=>{
    try{
        const blogId = req.params.blogId;
        console.log("post delete blog=>>",blogId)

        const deletedBlog = await Blog.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        const imageUrl = deletedBlog.imageUrl; 

        await Comment.deleteMany({ blogReference: blogId });

        if (imageUrl) {
            deleteImage(imageUrl);
        }

        res.json({
            success:true,
            message:"blog deleted successfully",
            deletedBlog
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


exports.postAddComment = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const { commentContent } = req.body;
        const userReference = req.session.user._id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            console.log("Blog not found");
            return res.status(404).send("Blog not found");
        }

        const comment = new Comment({
            blogReference: blogId, 
            userReference: userReference,
            commentContent: commentContent
        });

        const savedComment = await comment.save();

        await Blog.findByIdAndUpdate(
            blogId,
            { $push: { comments: savedComment._id } },
            { new: true }
        );

        res.redirect('/view-comment/' + blogId);
    } catch (err) {
        console.error("adding comment:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postAddCommentJson = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const { commentContent } = req.body;
        const userReference = req.user._id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            console.log("Blog not found");
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        

         const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
        
        const comment = new Comment({
            blogReference: blogId, 
            userReference: userReference,
            commentContent: commentContent
        });

        const savedComment = await comment.save();

        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $push: { comments: savedComment._id } },
            { new: true }
        );

        res.json({
            success:true,
            message: "Comment added successfully",
            updatedBlog,
            savedComment

        });
    } catch (err) {
        console.error("adding comment:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.getViewComment = async (req, res) => {
    try {
        const blogId = req.params.blogId;

        const blog = await Blog.findById(blogId)
            .populate('userReference', 'name')
            .populate({
                path: 'comments',
                populate: { path: 'userReference', select: 'name' }
            });

        if (!blog) {
            console.log("Blog not found");
            return res.redirect('/')
        }

        console.log("blog=>",blog)

        res.render('user/view-comment', {
            blog: blog,
            userId: req.session.isLoggedIn ? req.session.user._id.toString() : '',
        });

    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).send("Internal Server Error");
    }
};


exports.getViewCommentJson = async (req, res) => {
    try {
        const blogId = req.params.blogId;

        const blog = await Blog.findById(blogId)
            .populate('userReference', 'name')
            .populate({
                path: 'comments',
                populate: { path: 'userReference', select: 'name' }
            });

        if (!blog) {
            console.log("Blog not found");
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json( {
            blog: blog,
            userId: req.user ? req.user._id.toString() : '',
        });

    } catch (err) {
        console.error("Error in view comments:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.postLike = async (req, res) => {
    try {
        const blogId = req.params.blogId;

        const userId = req.session.user._id.toString();
        let liked;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        const hasLiked = blog.likes.includes(userId);
        if (hasLiked) {
            blog.likes.pull(userId);
            blog.totalLike = Math.max(0, blog.totalLike - 1);
            liked=false
        } else {
            blog.likes.push(userId);
            blog.totalLike += 1;
            liked=true
        }

        await blog.save();
        return res.json({ success: true, totalLike: blog.totalLike, liked });
        
    } catch (err) {
        console.error("Error in blog like:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.postLikeJson = async (req, res) => {
    try {
         const blogId = req.params.blogId;
        const userId = req.user._id.toString();
        let liked;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        const hasLiked = blog.likes.includes(userId);
        if (hasLiked) {
            blog.likes.pull(userId);
            blog.totalLike = Math.max(0, blog.totalLike - 1);
            liked=false
        } else {
            blog.likes.push(userId);
            blog.totalLike += 1;
            liked=true
        }

        await blog.save();
        return res.json({ success: true, totalLike: blog.totalLike, liked });
        
    } catch (err) {
        console.error("Error in blog like:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.getEditProfile=async(req,res)=>{
    try {
    const userReference = req.session.user._id;
    const user = await User.findById(userReference).select('-password')
    res.render('user/edit-profile',{
                errorMessage:'', 
                user,
                oldInput: {},
                validationError:[]
    })   
    } catch (error) {
        console.log(err);
        res.status(500).send('Internal Server Error');      
    }
    
}


exports.getEditProfileJson=async(req,res)=>{
    try {
    const user = req.user
    res.json({
        success:true,
        user
    })   
    } catch (error) {
        console.error("Error in getEditProfileJson", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });    
    }   
}


exports.postEditProfile=async(req,res)=>{
    try {
    const userReference = req.session.user._id;
    const user = await User.findById(userReference).select('-password')
    let { name,phone, dob } = req.body;
    const image = req.file;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const errors = validationResult(req);
    console.log("error=>",errors.array());
    
    if (!errors.isEmpty()) {
        return res.render('user/edit-profile', {
            user,
            errorMessage: errors.array()[0].msg,
            adminLogin: '',
            validationError: errors.array()
        });
    }  
    let updatedUser;
    if(!image){
        
        updatedUser= await User.findByIdAndUpdate(
            userReference,
            { 
                $set:{name,phone,dob}
            },
            {new : true}
        ).select('-password')   
    }
    else{
        console.log("Image is upload!!!!");
        updatedUser= await User.findByIdAndUpdate(
            userReference,
            {
                $set:{name,phone,dob,imageUrl:image.path}
            },
            {new : true}
        ).select('-password')  
    }
    
    return res.redirect("/")
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');   
    }
    
}


exports.postEditProfileJson=async(req,res)=>{
    try {
    const userReference = req.user._id;
    let { name,phone, dob } = req.body;
    const image = req.file;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            validationErrors: errors.array()
          });
    }  
    let updatedUser;
    if(!image){
        updatedUser= await User.findByIdAndUpdate(
            userReference,
            { 
                $set:{name,phone,dob}
            },
            {new : true}
        ).select('-password')   
    }
    else{
        updatedUser= await User.findByIdAndUpdate(
            userReference,
            {
                $set:{name,phone,dob,imageUrl:image.path}
            },
            {new : true}
        ).select('-password')  
    }
    
    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
      });

    } catch (error) {
       
        console.error("Edit Profile Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error"
        });
    }
    
}