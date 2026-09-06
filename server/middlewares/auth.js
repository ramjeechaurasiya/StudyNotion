const jwt =require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async(req,res,next)=>{
try{
    // fetch token from request header or cookie
    const token = req.cookies.token || req.body.token || req.header("Authorization").replace("bearer ","");

    // if token is not present , then return the response
    if(!token){
        return res.status(401).json({
            success:false,
            message:"token is missing, authorization denied",
        });
    }

// verify the token
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log("Decode",decode);
     req.User=decode;

    }

    catch(error){
        // if token is invalid or expired,then return the response
        return res.status(401).json({
            success:false,
            message:"Token is invalid or expired,authorization denied",
        })


    }
    next();

}

catch(error){
    // if any error occurs,then return the response
    return res.status(500).json({
        success:false,
        message:"Something went wrong in auth middleware",
    })

}
}

// isStudent
exports.isStudent = async(req,res,next)=>{
    try{
        if(req.User.accountType!=="student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Student only,you are not allowed to access",
            })
        }
        next();


    }
    catch(error){
        return res.status(500).json({
            success:false,
            meassage:"user role cannot be verified, please try again",
        })
    }
}


// isInstructor
exports.isInstructor = async(req,res,next)=>{
    try{
        if(req.User.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for instructor only,you are not allowed to access",
            })
        }
        next();


    }
    catch(error){
        return res.status(500).json({
            success:false,
            meassage:"user role cannot be verified, please try again",
        })
    }
}


// isAdmin
exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.User.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for admin only,you are not allowed to access",
            })
        }
        next();


    }
    catch(error){
        return res.status(500).json({
            success:false,
            meassage:"user role cannot be verified, please try again",
        })
    }
}
