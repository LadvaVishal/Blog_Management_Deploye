const User=require('../models/user')

const jwt = require('jsonwebtoken');

exports.isLogin= async (req,res,next)=>{
    try {

        const token = req.cookies.jwt_user;

        if (!token) {
            console.log("JWT not found, redirecting...");
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await User.findById(decoded.userId).select('-password') ;
        if (!user || !user.flag) {
            console.log("User not found or blocked");
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).send("Internal Server Error");
                }
                res.clearCookie('jwt_user');
                return res.redirect('/login');
            });
        }
        req.user = user;
        next()    
    } catch (err) {
        console.error("JWT verification error:", err.message);
        // res.clearCookie('jwt_user');
        return res.redirect('/login');        
    } 
} 

exports.isLoginJson = async (req, res, next) => {
    try { 
        let token = req.headers.authorization?.split(" ")[1];

        if (!token ) {
            console.log("JWT not found,");
            return res.status(401).json({ success: false, message: "JWT Token not found. Please login first !!!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded.role);
    
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.flag) {
            console.log("User not found or blocked");
            res.clearCookie('jwt_user'); 
            return res.status(401).json({ success: false, message: "User not found or blocked" });
        }
        req.user = user;
        next()  
    } catch (err) {
        console.error("JWT verification error (user):", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
