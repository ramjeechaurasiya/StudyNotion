const User =require("../models/User");
const OTP =require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// sendOTP
exports.sendOTP = async(req,res)=>{
   try{ // fetch email from request body
    const{email}=req.body;

    // check if user already exist
    const checkUserPresent = await User.findOne({email});

    // if user already exist, then return a response
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User already exist or registered",
        })

    }
// geneater otp
let otp= otpGenerator.generate(6,{
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
})

console.log("OTP genereted",otp);
// check otp is unquie or not
let result=await OTP.findOne({otp:otp});
while(result){
    otp=otpGenerator.generate(6,{
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
});
result=await OTP.findOne({otp:otp});
}
const otpPayload ={email,otp};

// create an entry for OTp
const otpBody=await OTP.create(otpPayload);
console.log(otpBody);

// resturn response successfully
 return res.status(200).json({
    success:true,
    message:"OTP sent Successfully",
    otp,

})

}

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
};


// signUP

exports.signUp = async(req,res) => {
try{
        // data fetch from rwuesr ki body
     const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
     } = req.body;

    // validate karo
    if(!firstName || !lastName || !email || ! password || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        });
    }

    //  2 password march karlo
    if(password!=confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and ConfirmPassword Value does not match, please try agaain ",
        });
    }

    // check user alreadry exist or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User is already registered",
        });
    }

    //  find most recent OTP stored for the user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);

    // validate otp
   if(recentOtp.length==0){
    // OTP not found
    return res.status(400).json({
        success:false,
        message:"OTp not fonud",
    })
   }else if(otp !== recentOtp[0].otp){
    // invalid OTP
    return res.status(400).json({
        success:false,
        message:"Invalid OTP",
    })

   }


    // hash password 
    const hashedPassword = await bcrypt.hash(password,10);

    // profile creating
const profileDetails = await Profile.create({
    gender:null,
    dateOfBirth:null,
    about:null,
    contactNumber:null,
});

    // entry create in DB
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

    });
    // return res
    return res.status(200).json({
        success:true,
        message:"User is registered Successfully",
        user,
    });

}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"User can not registered, please try again",
    })


}


}

// login
exports.login = async(req,res)=>{
    try{
        // get data fron req body
        const{email,password}=req.body;

        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                messsage:"All fields are required,please try again",
            });
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registerded, please signup first",
            });
        }
        // generate JWT, after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload ={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const option ={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,option).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }

        else{
            return res.status(401).json({
                success:false,
                message:"password in incorrect",
            })
        }
       

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
                success:false,
                message:"login failure,please try again",
            })

    }

};


// changePassword
exports.changePassword = async(req,res)=>{ 
    try{ 

        // get data from req body 
        // get old password,newPassword,and confirmedPassword 
        const {oldPassword,newPassword,confirmedPassword}=req.body; 
 
        // validation 
        if(!oldPassword || !newPassword || !confirmedPassword){ 
            return res.status(403).json({ 
                success:false, 
                message:"All fields are required,please try again", 
            }); 
        } 

        // check old password is correct or not 
        const userDetails = await User.findById(req.user.id); 
 
        if(!userDetails){ 
            return res.status(400).json({ 
                success:false, 
                message:"user not found,please try again", 
            }); 
        } 

        const isPasswordmatched = await bcrypt.compare(
            oldPassword,
            userDetails.password
        ); 
 
        if(!isPasswordmatched){ 
            return res.status(400).json({ 
                success:false, 
                message:"Old password is incorrect,please try again", 
            }); 
        } 
 
        // check new password and confirmedPassword is same or not 
 
        const isPasswordSame = await bcrypt.compare(
            newPassword,
            userDetails.password
        ); 
 
        if(isPasswordSame){ 
            return res.status(400).json({ 
                success:false, 
                message:"new Password can not be same as old Password", 
            }); 
        } 

        if(newPassword !== confirmedPassword){ 
            return res.status(400).json({ 
                success:false, 
                message:"new password and confirmed password does not match", 
            }); 
        } 

        // hash new password 
        const hashedPassword = await bcrypt.hash(newPassword,10); 

        // update password in DB 
        userDetails.password = hashedPassword; 

        await userDetails.save(); 

        // return response 
        return res.status(200).json({ 
            success:true, 
            message:"Password changed successfully", 
        }); 

    } 
    catch(error){ 

        console.log(error); 

        return res.status(500).json({ 
            success:false, 
            message:"Password can not be changed,please try again", 
        }); 
    } 
}