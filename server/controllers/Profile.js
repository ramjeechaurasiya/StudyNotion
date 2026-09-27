const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile =async(req,res)=>{
    try{
        // get data 
        const{dateOfBirth="",about="",contactNumber,gender}=req.body;

        // get userid
        const id=req.user.id;

        // validation
        if(!contactNumber || !gender ||!id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth= dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender= gender;
        profileDetails.contactNumber=contactNumber;

        await profileDetails.save();

        // return response
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        })

    }
}

// deleteAccount

// Explore-> how can we schedule this deletion operation


exports.deleteAccount = async(req,res)=>{
    try{
        // get id
        const id =req.user.id;

        // validation
        const userdetails =await User.findById(id);
        if(!userdetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({_id:userdetails.additionalDetails});
        
        // TODO HW unenroll user from all enrolled course


        // delete user
        await User.findByIdAndDelete({_id:id});

        // What is cron job?

        // return response
        return res.status(200).json({
            success:true,
            message:"User deleted Successfully",

        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User cant not deleted successfully",
        })

    }
}



exports.getAllUserDetails = async(req,res)=>{
    try{
        // get id
        const id=req.user.id;
        //  validation and get user details
        const userDetails =await User.findById(id).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success:true,
            message:"User ka data fetch successfully",
        })

    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:"User cannot fetch successfully",
        })


    }
}