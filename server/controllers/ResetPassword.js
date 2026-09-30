const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");




// resetPasswordToken
exports.resetPasswordToken = async(req,res)=>{
try{
        // get email from req body
    const email = req.body.email;
    // check user for this email, email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(404).json({
            success:false,
            message:"Your Email is not registered with us,please register first",
        })
    }
    // genrate token and save it in user collection and expiration time  also save in user collection
    const token = crypto.randomUUID();
    const updateDetails = await User.findOneAndUpdate(
                                         {email:email,},
                                         { token:token,
                                            resetPasswordExpires:Date.now() +5*60*1000,
                                        },
                                            {
                                         new:true,});

    // create a link with token and send  it to user email
    const url =`http://localhost:3000/update_password/${token}`;
    // send email to user with reset password link containing token
    await mailSender(email,"Password Reset Link",`Password reset link is ${url}. PLease note that this link will expire in 5 minutes, please reset your password before that.`);
    // return response to user that email has been  sent successfully with reset password link
    return res.status(200).json({
        success:true,
        message:"Password rest link bas been sent successfully to your email.",
    })

}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Something went wrong while sending reset password link, please try again",
 })
}

}


// resetPassword

exports.resetPassword = async(req,res)=>{
    try{
        // data fetch
    const {token,password,confirmPassword} =req.body;
    // validation
    if(!password || !confirmPassword){
        return res.status(403).json({
            sucess:false,
            message:"Password and confirmPassword did not match",
        })
    }
    // get userdetails from db using token
    const userDetails = await User.findOne({token:token});
    // if no  entry - invalid token
    if(!userDetails){
        return res.status(401).json({
            success:false,
            message:"Token is invalid or expired",
        })
    }
    // token time check
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.status(401).json({
            success:false,
            message:"Token is expired,please genrate your token",
        })

    }
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);
    // password update in db
    await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
    // return response to user
    return res.status(200).json({
        success:true,
        message:"Password has been rest successfully",
    })

}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Reset password failure, please try again",
    })
}


    }