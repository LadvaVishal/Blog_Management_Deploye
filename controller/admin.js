const mongoose=require('mongoose')
require('dotenv').config(); 
const nodemailer=require('nodemailer')
const sendgridTransport=require('nodemailer-sendgrid-transport')

const Blog=require('../models/blog')
const User=require('../models/user')
const Comment=require('../models/comment')
const deleteImage=require('../util/delete-image')


const transporter=nodemailer.createTransport(sendgridTransport(
    {
      auth:{   
        api_key:process.env.SENDGRID_API_KEY
      }
    }
  ))


exports.getIndex = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments(); 
        const totalBlogs = await Blog.countDocuments(); 

        const topBlogs = await Blog.find()
            .populate('userReference', 'name') 
            .populate('comments') 
            .sort({ totalLike: -1, createdAt: -1 }) 
            .limit(10);

        const topUsers = await Blog.aggregate([
            {
                $sort: { totalLike: -1, createdAt: -1 }
            },
            {
                $group: {
                    _id: "$userReference",
                    mostLikedBlog: { $first: "$$ROOT" } 
                }
            }, 
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user" 
            },
            {
                $project: {
                    _id: 1,
                    "user.name": 1, 
                    "mostLikedBlog.title": 1, 
                    "mostLikedBlog.totalLike": 1, 
                    "mostLikedBlog.createdAt": 1 
                }
            },
            { $sort: { "mostLikedBlog.totalLike": -1, "mostLikedBlog.createdAt": -1 } },
            { $limit: 10 } 
        ]);

        res.render('admin/index',{
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            totalUsers,
            totalBlogs,
            topBlogs,
            topUsers
        })

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");

    }
};

exports.getIndexJson = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments(); 
        const totalBlogs = await Blog.countDocuments(); 

        const topBlogs = await Blog.find()
            .populate('userReference', 'name') 
            .populate('comments') 
            .sort({ totalLike: -1, createdAt: -1 }) 
            .limit(10);

        const topUsers = await Blog.aggregate([
            {
                $sort: { totalLike: -1, createdAt: -1 }
            },
            {
                $group: {
                    _id: "$userReference",
                    mostLikedBlog: { $first: "$$ROOT" } 
                }
            }, 
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user" 
            },
            {
                $project: {
                    _id: 1,
                    "user.name": 1, 
                    "mostLikedBlog.title": 1, 
                    "mostLikedBlog.totalLike": 1, 
                    "mostLikedBlog.createdAt": 1 
                }
            },
            { $sort: { "mostLikedBlog.totalLike": -1, "mostLikedBlog.createdAt": -1 } },
            { $limit: 10 } 
        ]);

       return res.json({
            success: true,
            totalUsers,
            totalBlogs,
            topBlogs,
            topUsers
        });

    } catch (err) {
        console.error("Error in admin index:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.getAllBlog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
  
        const searchQuery = req.query.search || "";
        let limit=req.query.limit || 3; 

        let ITEMS_PER_PAGE = limit;

        const filter = searchQuery ? { title: { $regex: searchQuery.trim(), $options: "i" } } : {};

        const numBlogs = await Blog.countDocuments(filter);
        if(limit==0){
            ITEMS_PER_PAGE=numBlogs
        }

        const blogs = await Blog.find(filter)
            .populate('userReference', 'name imageUrl isVerified flag _id') 
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('admin/all-blog', {
            blog: blogs,
            searchQuery,
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < numBlogs,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(numBlogs / ITEMS_PER_PAGE),
            limit

        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};


exports.getAllBlogJson = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
  
        const searchQuery = req.query.search || "";
        let limit=req.query.limit || 3; 
        let ITEMS_PER_PAGE = limit;
        const filter = searchQuery ? { title: { $regex: searchQuery.trim(), $options: "i" } } : {};

        const numBlogs = await Blog.countDocuments(filter);
        if(limit==0){
            ITEMS_PER_PAGE=numBlogs
        }
        const blogs = await Blog.find(filter)
            .populate('userReference', 'name imageUrl isVerified flag _id') 
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        return res.json({
                success: true,
                blogs,
                searchQuery,
                isAdminLoggedIn: req.session.isAdminLoggedIn,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < numBlogs,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(numBlogs / ITEMS_PER_PAGE),
                limit
            });
    } catch (err) {
        console.error("Error on all blog of admin page:", err);
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
            })
            .populate({
                path: 'likes',
                model: 'User',
                select: 'name' 
            });
            if (!blog) {
                console.log("No blog Found!!")
                return res.redirect('/admin/all-blog');
            }
        res.render('admin/view-comment', {
            blog: blog,
            isAdminLoggedIn: req.session.isAdminLoggedIn
        });

    } catch (err) {
        console.error(err);
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
            })
            .populate({
                path: 'likes',
                model: 'User',
                select: 'name' 
            });

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            }
        res.json({
            success: true,
            blog,
            isAdminLoggedIn: req.session.isAdminLoggedIn
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        let { sortField, sortOrder, dobStart, dobEnd, createdAtStart, createdAtEnd , username, page = 1, limit = 3} = req.query;

        let ITEMS_PER_PAGE = limit;

        let filter = {};
        let sort = {};

        if (username) {
            const searchRegex = { $regex: username.trim(), $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }, 
            ];
        }
        
        if (dobStart || dobEnd) {
            filter.dob = {}; 
            if (dobStart){ filter.dob.$gte = new Date(dobStart);}
            if (dobEnd){ filter.dob.$lte = new Date(dobEnd); }
        }

        if (createdAtStart || createdAtEnd) {
            filter.createdAt = {};
            if (createdAtStart){ filter.createdAt.$gte = new Date(createdAtStart);}
            if (createdAtEnd) {filter.createdAt.$lte = new Date(createdAtEnd);}
        }

        if (sortField && sortOrder) {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        }
        else{
            sort = {createdAt: -1 }
        }

        const totalUsers = await User.countDocuments(filter);
        if(limit==0){
            ITEMS_PER_PAGE = totalUsers;
        }

 
        const skip = (page - 1) * ITEMS_PER_PAGE; 
        const users = await User.find(filter).sort(sort).skip(skip).limit(Number(ITEMS_PER_PAGE)).select('-password');
       
        const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
        res.render('admin/users', { 
            users,
            pagination: {
                currentPage: Number(page),
                totalPages,
                hasPreviousPage: page > 1,
                previousPage: page > 1 ? Number(page) - 1 : null,
                hasNextPage: page < totalPages,
                nextPage: page < totalPages ? Number(page) + 1 : null,
                lastPage: totalPages,
                limit
            },
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            filters: {
                sortField,
                sortOrder,
                dobStart,
                dobEnd,
                createdAtStart,
                createdAtEnd,
                username
            }
         });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.getUserDetailsJson = async (req, res) => {
    try {
        let { sortField, sortOrder, dobStart, dobEnd, createdAtStart, createdAtEnd , search, page = 1, limit = 3} = req.query;

        let filter = {};
        let sort = {};
  
        if (search) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
            ];
        }    
        if (dobStart || dobEnd) {
            filter.dob = {}; 
            if (dobStart){ filter.dob.$gte = new Date(dobStart);}
            if (dobEnd){ filter.dob.$lte = new Date(dobEnd); }
        }

        if (createdAtStart || createdAtEnd) {
            filter.createdAt = {};
            if (createdAtStart){ filter.createdAt.$gte = new Date(createdAtStart);}
            if (createdAtEnd) {filter.createdAt.$lte = new Date(createdAtEnd);}
        }

        if (sortField && sortOrder) {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        }
        else{
            sort = {createdAt: -1 }
        }
        const totalUsers = await User.countDocuments(filter);
        if(limit==0){
            limit=totalUsers
        }

        const skip = (page - 1) * limit;
        const users = await User.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-password');
        const totalPages = Math.ceil(totalUsers / limit);
    if (users.length<=0) {
        return res.json({
            success: true,
            message:"No User Found",
            pagination: {
                currentPage: Number(page),
                totalPages,
                hasPreviousPage: page > 1,
                previousPage: page > 1 ? Number(page) - 1 : null,
                hasNextPage: page < totalPages,
                nextPage: page < totalPages ? Number(page) + 1 : null,
                lastPage: totalPages,
                limit
            },
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            filters: {
                sortField,
                sortOrder,
                dobStart,
                dobEnd,
                createdAtStart,
                createdAtEnd,
                search
            }
         });
  
    }

    return res.json({
            success: true,
            users,
            pagination: {
                currentPage: Number(page),
                totalPages,
                hasPreviousPage: page > 1,
                previousPage: page > 1 ? Number(page) - 1 : null,
                hasNextPage: page < totalPages,
                nextPage: page < totalPages ? Number(page) + 1 : null,
                lastPage: totalPages,
                limit
            },
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            filters: {
                sortField,
                sortOrder,
                dobStart,
                dobEnd,
                createdAtStart,
                createdAtEnd,
                search
            }
         });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
        
    }
};


exports.getManageBlog = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password');;
        if (!user) {
            return res.render('error', { message: "User not found" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;

        const totalBlogs = await Blog.countDocuments({ userReference: userId });
        const lastPage = Math.ceil(totalBlogs / limit);

        const blogs = await Blog.find({ userReference: userId })
            .populate({
                path: 'comments',
                populate: { path: 'userReference', select: 'name' }
            })
            .skip(skip)
            .limit(limit);
       
        res.render('admin/user-blogs', {
            user, 
            blogs,
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            currentPage: page,
            lastPage: lastPage,
            hasPreviousPage: page > 1,
            hasNextPage: page < lastPage,
            previousPage: page - 1,
            nextPage: page + 1
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getManageBlogJson = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 3; // Blogs per page
        const skip = (page - 1) * limit;

        const totalBlogs = await Blog.countDocuments({ userReference: userId });
        const lastPage = Math.ceil(totalBlogs / limit);


        const blogs = await Blog.find({ userReference: userId })
            .populate({
                path: 'comments',
                populate: { path: 'userReference', select: 'name' }
            })
            .skip(skip)
            .limit(limit);
       
     return res.json({
            success: true,
            user, 
            blogs,
            isAdminLoggedIn: req.session.isAdminLoggedIn,
            currentPage: page,
            lastPage: lastPage,
            hasPreviousPage: page > 1,
            hasNextPage: page < lastPage,
            previousPage: page - 1,
            nextPage: page + 1
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.postDeleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const deletedBlog = await Blog.findByIdAndDelete(blogId);
        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const userId = deletedBlog.userReference;  
        const imageUrl = deletedBlog.imageUrl; 

        await Comment.deleteMany({ blogReference: blogId });

        if (imageUrl) {
            deleteImage(imageUrl);
        }

        res.redirect(`/admin/manage-blog/${userId}`);

    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.postDeleteBlogJson = async (req, res) => {
    try {
        const { blogId } = req.params;
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

    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



exports.postDisableBlog = async (req, res, next) => {
    try {
        const {userId } = req.body;
        const blogId = req.params.blogId;

        await Blog.findByIdAndUpdate(blogId, { $set: { flag: false } });

        res.redirect(`/admin/manage-blog/${userId}`);
        } 
        catch (err) {
        console.error("Error in disable blog:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postDisableBlogJson = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $set: { flag: false } },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({
            success: true,
            message: "Blog disabled successfully",
            blog: {
                _id: updatedBlog._id,
                title: updatedBlog.title,
                flag: updatedBlog.flag,
            }
        });
    } catch (err) {
        console.error("Error in disable blog:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.postEnableBlog = async (req, res) => {
    try {
        const { userId } = req.body;
        const blogId = req.params.blogId;
        await Blog.findByIdAndUpdate(blogId, { $set: { flag: true } });

        res.redirect(`/admin/manage-blog/${userId}`);
    } catch (err) {
        console.error("Error in enable blog:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postEnableBlogJson = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $set: { flag: true } },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.json({
            success: true,
            message: "Blog enabled successfully",
            blog: {
                _id: updatedBlog._id,
                title: updatedBlog.title,
                flag: updatedBlog.flag,
            }
        });
    } catch (err) {
        console.error("Error in enabling blog:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


exports.postDeleteUser = async (req, res) => {
    try {
        const {userName} = req.body;  
        const {userId} = req.params;  

        const deleteUser= await User.findByIdAndDelete(new mongoose.Types.ObjectId(userId));

        if(!deleteUser){
            console.log("User Not found")
            res.redirect(`/admin/user-details`);
        }
        const deletUserImg=deleteUser.imageUrl;
        if (deletUserImg) {
            deleteImage(deletUserImg);
        }
    
        const userBlogs = await Blog.find({ userReference: userId });
        for (const blog of userBlogs) {
            if (blog.imageUrl) 
                {
                deleteImage(blog.imageUrl); // Delete blog image
            }
        }

       const allDeletedBlog= await Blog.deleteMany({ userReference: userId });

        await Comment.deleteMany({ userReference: userId });

        await Blog.updateMany(
            { likes: userId },
            { 
                $pull: { likes: userId },  
                $inc: { totalLike: -1 }    
            }
        );
        res.redirect(`/admin/user-details?deletedUser=${userName}`);

    } catch (err) {
        console.error(err);
    }
};


exports.postDeleteUserJson = async (req, res) => {
    try {
        const {userId} = req.params;  
        const deletedUser= await User.findByIdAndDelete(new mongoose.Types.ObjectId(userId));

        if(!deletedUser){
            console.log("User Not found")
         return res.json({
                success:false,
                message:"User Not found",
                deletedUser
            })
        }

        const deletUserImg=deletedUser.imageUrl;
        if (deletUserImg) {
            deleteImage(deletUserImg);
        }
    
        const userBlogs = await Blog.find({ userReference: userId });
        for (const blog of userBlogs) {
            if (blog.imageUrl) {
                deleteImage(blog.imageUrl); 
            }
        }

        await Blog.deleteMany({ userReference: userId });

        await Comment.deleteMany({ userReference: userId });

        await Blog.updateMany(
            { likes: userId },
            { 
                $pull: { likes: userId },  
                $inc: { totalLike: -1 }    
            }
        );

        res.json({
            success:true,
            message:"User deleted successfully",
            deletedUser
        })

    } catch (err) {
        console.error("Error in post delete user",err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.postToggleUser=async (req, res) => {
    try {

        const {flag } = req.body;
        const userId = req.params.userId;

       const user = await User.findByIdAndUpdate(userId, { flag }, { new: true }).select('-password');

        await Blog.updateMany({ userReference: userId }, { flag });

        const email=user.email;
        if(!flag){
        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Account Blocked"',
            html: `
                <h2>Hello ${user.name},</h2>
                <p>We are writing to inform you that your account has been temporarily blocked.</p>
            `
        });
        console.log("email was send successfully on",email);
    }
 
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


exports.postToggleUserJson=async (req, res) => {
    try {
        const {flag } = req.body;
        const userId = req.params.userId;

        const user = await User.findByIdAndUpdate(userId, { flag }, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await Blog.updateMany({ userReference: userId }, { flag });

        const email=user.email;
        if(!flag){
        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Account Blocked"',
            html: `
                <h2>Hello ${user.name},</h2>
                <p>We are writing to inform you that your account has been temporarily blocked.</p>
            `
        });
        console.log("email was send successfully on",email);
    }
        return res.json({
            success: true,
            message: `${user.name} ${flag ? 'unblocked' : 'blocked'} successfully.`,
            userId: user._id,
            userName: user.name,
            newFlag: flag
        });
    } catch (error) {
        console.error("Error toggling user:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}