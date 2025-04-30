const bcrypt=require('bcryptjs')
const User=require('../models/user')
const Admin=require('../models/admin')
const jwt = require('jsonwebtoken');

require('dotenv').config(); 

const crypto = require('crypto'); 
const {validationResult}=require('express-validator')
const nodemailer=require('nodemailer')
const sendgridTransport=require('nodemailer-sendgrid-transport')

const transporter=nodemailer.createTransport(sendgridTransport(
    {
      auth:{   
        api_key:process.env.SENDGRID_API_KEY
      }
    }
  ))


exports.getSignup=(req,res)=>{
    res.render('auth/signup',{
        errorMessage:'',
        oldInput: { },
        validationError:[],
        adminLogin:''
    })
}

exports.getSignupJson = (req, res) => {
    res.json({
        success: true, 
        message: "Get Signup page is working",
    });
};



exports.postSignup = async (req, res) => {
    try {
        let { name, email, phone, dob, password, confirmPassword } = req.body;
        const userImg = req.file;
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/signup', {
                errorMessage: errors.array()[0].msg,
                oldInput: { name, email, password, phone, dob, confirmPassword },
                adminLogin: '',
                validationError: errors.array()
            });
        }

        const token = crypto.randomBytes(32).toString('hex');

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            phone,
            dob,
            imageUrl: userImg ? userImg.path : null,
            password: hashedPassword,
            verificationToken: token,
            isVerified: false
        });

        await user.save();

        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Verify Your Email',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
                <a href="http://localhost:3000/verify-email/${token}">Verify Email</a>
            `
        });

        return res.render('auth/post-signup', {
            Message: 'Verification email sent. Please check your inbox.'
        });

    } catch (err) {
        console.error(err);
        return res.redirect('/signup');
    }
};

exports.postSignupjson = async (req, res) => {
    try {
        let { name, email, phone, dob, password, confirmPassword } = req.body;
        const image = req.file;

        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errorMessage: errors.array()[0].msg,
                oldInput: { name, email, password, phone, dob, confirmPassword },
                validationErrors: errors.array(),
            });
        }


        const token = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            phone,
            dob,
            imageUrl: image ? image.path : null,
            password: hashedPassword,
            verificationToken: token,
            isVerified: false
        });

        await user.save();

        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Verify Your Email',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
                <a href="http://localhost:3000/verify-email-json/${token}">Verify Email</a>
            `
        });

        return res.status(201).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
            userId: user._id
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

exports.getLogin=(req,res)=>{
    res.render('auth/login',{
        errorMessage:'',
        oldInput:{},
        adminLogin:''

    })
}

exports.getLoginJson=(req,res)=>{

    res.json({ 
        success: true, 
        message: "Get Login page is working",
     });
}


exports.postLogin = async (req, res) => {   //
    try {

        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password },
                adminLogin: ''

            });
        }

        const user = await User.findOne({ email });
        // if (!user || !user.flag || !user.isVerified) {
        if (!user || !user.flag) {

            if(!user){
                errorMessage = "Email does not exist";
            }else if(!user.flag){
                errorMessage = "Your account has been blocked by the admin."
            }
            // else if(!user.isVerified){
            //     errorMessage = "Your email is not verify."
            // }

            // console.log(errorMessage);

            return res.render('auth/login', {
                errorMessage,
                oldInput: { email, password },
                adminLogin: ''
                // ,validationError: [],
               
            });
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            console.log("Password does not match");

            return res.render('auth/login', {
                errorMessage: 'Incorrect Password',
                oldInput: { email, password },
                adminLogin: ''
        
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role:"user"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );


        res.cookie('jwt_user', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: true,

        });
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.token=token;

        req.session.save(err => {
            if (err){ console.error("Session save error:", err);}
            res.redirect('/');
        });

    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


exports.postLoginJson = async (req, res) => {   
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password },
                // adminLogin: '',
                validationError: errors.array()
            })
        } 

        const user = await User.findOne({ email });
        // if (!user || !user.flag || !user.isVerified) {
        if (!user || !user.flag) {

            if(!user){
                errorMessage = "Email does not exist";
            }else if(!user.flag){
                errorMessage = "Your account has been blocked by the admin."
            }
            // else if(!user.isVerified){
            //     errorMessage = "Your email is not verify."
            // }

            // console.log(errorMessage);

            return res.status(400).json( {
                success: false,
                errorMessage,
                oldInput: { email, password },
               
            });
        }
 
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            console.log("Password does not match");

            return res.status(400).json( {
                success: false,
                errorMessage: 'Incorrect Password',
                oldInput: { email, password },
               
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role:"user"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        // console.log("Login user jwt token:")

        res.cookie('jwt_user', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            // secure: true,

        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { 
                _id: user._id,
                email: user.email
            }
        });


    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({ success: false, errorMessage: "Internal Server Error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid token or user not found');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        
        await user.save();
 
        res.render('auth/login',{
            errorMessage:'',
            oldInput:{},
            adminLogin:''
        })

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.verifyEmailJson = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token or user not found"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;

        await user.save();

        return res.json({
            success: true,
            message: "Email verification successful."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



exports.getForgotPassword = async (req, res) => {
    try {
        res.render('auth/forgot-password',{
             errorMessage:'',
             email:'' 
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.getForgotPasswordJson = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Please enter your registered email to reset your password",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}



exports.postForgotPassword= async (req, res) => {
    try {
        const email=req.body.email;

        const user=await User.findOne({email:email})
        if(!user){
            return res.render('auth/forgot-password',{
                errorMessage:'Email does not exist',
                email
           })   
        }

        const token = crypto.randomBytes(32).toString('hex');
        
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        
        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Reset Password',
            html:  `
                <h2>Hello ${user.name},</h2>
                <p>Click the link below to reset your password:</p>
                <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                `
        });

        return res.render('auth/post-signup', {
            Message: 'Verification email sent. Please check your inbox.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.postForgotPasswordJson= async (req, res) => {
    try {
        const email=req.body.email;
        const user=await User.findOne({email:email})

        if(!user){
            return res.status(400).json({
                success: false,
                errorMessage:'Email does not exist',
                email
           })   
        }

        const token = crypto.randomBytes(32).toString('hex');
        
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        
        await transporter.sendMail({
            to: email,
            from: process.env.FROMEMAIL,
            subject: 'Reset Password',
            html:  `
                <h2>Hello ${user.name},</h2>
                <p>Click the link below to reset your password:</p>
                <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                `
        });

        return res.json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.',
            // resetToken: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}



exports.getNewPassword = async (req, res) => {
    try {

        const token = req.params.token;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('auth/post-signup', {
               Message: 'Invalid or expired token'
            });
        }

        res.render('auth/new-password', {
            errorMessage: null,
            userId: user._id.toString(),
            token: token,
            oldPassword:'',
            oldConfirmPassword:''

        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.getNewPasswordJson = async (req, res) => {
    try {

        const token = req.params.token;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            userId: user._id.toString(),
            // token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}


exports.postNewPassword = async (req, res) => {
    try {

        const { password, userId } = req.body;
        const token = req.params.token;

        // Validate passwords
        // if (password !== confirmPassword) {
        //     return res.render('auth/new-password', {
        //         errorMessage: 'Passwords do not match!',
        //         userId,
        //         token
        //     });
        // }

        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('auth/post-signup', {
                Message: 'Invalid or expired token'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();
        res.render('auth/login', {
            errorMessage: 'Password reset successful! You can now log in.',
            oldInput: {},
            adminLogin: ''
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.postNewPasswordJson = async (req, res) => {
    try {
        const { password, userId } = req.body;
        const token = req.params.token;

        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.postUserLogout = (req, res) => {

    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).send("Internal Server Error");
        }

        res.clearCookie('jwt_user'); 
        console.log("Session destroyed and JWT cookie cleared.");
        return res.redirect('/login');
    });
  };

exports.postUserLogoutJson = (req, res) => {
    try {
        res.clearCookie('jwt_user'); 
        console.log("Session destroyed and JWT cookie cleared.");
        res.json({ 
            success: true, 
            message: "User Logged out successfully",
        });  
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });   
    }
    };



exports.getAdminLogin=(req,res)=>{
    res.render('auth/login',{
        errorMessage:'',
        oldInput:{},
        adminLogin:'true'
    })
    }

exports.getAdminLoginJson=(req,res)=>{
    return res.json({
                success: true,
                message: "Admin login Page!!",
                adminLogin: true
    });
}


exports.getAdminSignup=(req,res)=>{
    res.render('auth/signup',{
        errorMessage:'',
        oldInput:{},
        adminLogin:'true'
    })
}

exports.getAdminSignupJson=(req,res)=>{
    return res.json({
        success: true,
        message: "Admin Signup Page!!",
        adminLogin: true
        
    });
}



exports.postAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password },
                adminLogin: 'true'
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log("Email does not exist");
            return res.render('auth/login', {
                errorMessage: 'Email does not exist',
                oldInput: { email, password },
                validationError: [],
                adminLogin: 'true'
            });
        }

        const matched = await bcrypt.compare(password, admin.password);
        if (!matched) {
            console.log("Password not matched");
            return res.render('auth/login', {
                errorMessage: 'Incorrect Password',
                oldInput: { email, password },
                validationError: [],
                adminLogin: 'true'
            });
        } else {

            const token = jwt.sign(
                {
                    adminId: admin._id,
                    email: admin.email,
                    role:"admin"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
                }
            );


            res.cookie('jwt_admin', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 
            });

            req.session.isAdminLoggedIn = true;
            req.session.admin = admin;
            
            req.session.save(err => {
                if (err) {
                    console.log("Session Save Error:", err);
                }
                res.redirect('/admin/index');
            });
           
        }
    } catch (err) {
        console.error("Error in Admin Login:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postAdminLoginJson = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                oldInput: { email, password },
                adminLogin: true
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log("Email does not exist");
            return res.status(400).json({
                success: false,
                message: "Email does not exist",
                oldInput: { email, password },
                adminLogin: true
            });
        }

        
        const matched = await bcrypt.compare(password, admin.password);
        if (!matched) {
            console.log("Password not matched");
            return res.status(400).json({
                success: false,
                message: "Incorrect Password",
                oldInput: { email, password },
                adminLogin: true
            });
        }

        const token = jwt.sign(
            {
                adminId: admin._id,
                email: admin.email,
                role:"admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );


        res.cookie('jwt_admin', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            },
            token
        });

    } catch (err) {
        console.error("Error in Admin Login:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
  

exports.postAdminSignup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('auth/signup', {
                errorMessage: errors.array()[0].msg,
                oldInput: { name, email, phone, password },
                adminLogin: 'true',
                validationError: errors.array()
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = new Admin({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await admin.save();
        
        res.redirect('/admin-login');
        
    } catch (err) {
        console.error("error in Admin signup", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postAdminSignupJson = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = new Admin({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin registered successfully. Please log in.",
        });

    } catch (err) {
        console.error("Error in Admin signup:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};



exports.postAdminLogout = (req, res) => {

    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).send("Internal Server Error");
        }

        res.clearCookie('jwt_admin'); 
        console.log("Session destroyed and JWT cookie cleared.");
        return res.redirect('/login');
    });
  };



  exports.postAdminLogoutJson = (req, res) => {
    try {
        res.clearCookie('jwt_admin'); 
        console.log("Session destroyed and JWT cookie cleared.");
        res.json({ 
            success: true, 
            message: "Admin Logged out successfully",
        });
        }
        catch (error) {
        console.error("Error in postAdminLogoutJson:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });  
    }
    };
