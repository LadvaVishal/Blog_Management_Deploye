const Admin=require('../models/admin')
const jwt = require('jsonwebtoken');

exports.isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt_admin;

        if (!token) {
            console.log("JWT not found for admin. Please login first");
            return res.status(401).redirect('/admin-login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            console.log("Admin not found");
            res.clearCookie('jwt_admin');
            return res.status(401).redirect('/admin-login');
        }
        next();
    } catch (err) {
        console.error("JWT verification error (admin):", err.message);
        return res.status(401).redirect('/admin-login');
    }
};

exports.isAdminJson=async (req, res, next) => {
    try {

        let token = req.headers.authorization?.split(" ")[1]; 

        if (!token ) {
            console.log("JWT not found for admin. Please login first");
            return res.status(401).json({ success: false, message: "JWT not found for admin. Please login first"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.adminId).select('-password');
        if (!admin) {
            console.log("Admin not found");
            res.clearCookie('jwt_admin');
            return res.status(401).json({ success: false, message: "Admin Not found !!"})
        }
        req.admin = admin;
        next();
    } catch (err) {
        console.error("JWT verification error (admin):", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};