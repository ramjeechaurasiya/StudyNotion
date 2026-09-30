const Course= require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

exports.createCourse =async(req,res)=>{
    try{
        // fetch data
        const{courseName,courseDescription,whatYouWillLearn,price,category}=req.body;

        // get thumbnail
        const thumbnail =req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("INstructor Details: ",instructorDetails);
// TODO: Verify that userId and instructorDetails._id are same or different ?

      if(!instructorDetails){
        return res.status(400).json({
            success:false,
            message:"Instructor Details not found",
        });
      }

    //   check given category is valid or not
    const categoryDetails = await Category.findById(category);
    if(!categoryDetails){
        return res.status(404).json({
            success:false,
            message:"Category Details not found",
        });
    }
    const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

    // create an entry for new couurse
    const newCourse =await Course.create({
        courseName,
        courseDescription,
        instructor:instructorDetails._id,
        whatYouWillLearn:whatYouWillLearn,
        price,
        category:categoryDetails._id,
        thumbnail:thumbnailImage.secure_url,
    })

    // add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
        {
            _id:instructorDetails._id},
            {
            $push:  {
                courses:newCourse._id,
            }  
            },
            {new:true},
        
    )



// update the Category ka schema
//HW
await Category.findByIdAndUpdate(
            categoryDetails._id,
            {
                $push: {
                    course: newCourse._id,
                },
            },
            {
                new: true,
            }
        );


return res.status(200).json({
    success:true,
    message:"COurse Created Successfully",
    data:newCourse,
});

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        })

    }
}



// getall course handler function
exports.showAllCourses = async(req,res)=>{
    try{
        // TODO : change the below statement increamentally
        // {
        //     courseName:true,
        //     price:true,
        //     thumbnail:true,
        //     instructor:true,
        //     ratingAndReviews:true,
        //     studentsEnrolled:true,

        // }

        // .populate("instructor")
        //.exec();

        const allCourse = await Course.find({})

        return res.status(200).json({
            success:true,
            message:"Data for all course fetch successfully",
            data:allCourse,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        });

    }
}



// getCourseDetails

exports.getCourseDetails=async(req,res)=>{
    try{
        // get id
        const {courseId}=req.body;
       const courseDetails = await Course.find({_id:courseId})
                                               .populate({
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                }
                                               })    
                                               .populate("category")
                                               .populate("ratingAndReviews") 
                                               .populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                },
                                               })
                                               .exec();
        // validation  
               if(!courseDetails){
                return res.status(400).json({
                    success:false,
                    message:`Could not find the course with ${courseId}`,
                });
               }  

            //    return response;

            return res.status(200).json({
                success:true,
                message:"Course Details fetche successfully",
                data:courseDetails,

            })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
}