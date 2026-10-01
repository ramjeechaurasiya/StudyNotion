const Category = require("../models/Category");

exports.createCategory = async(req,res)=>{
    try{
        const{name,description} = req.body;
    if(!name || !description){
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
    }
    const categoryDetails = await Category.create({
        name:name,
        description:description,
    });
    console.log(categoryDetails);
    return res.status(200).json({
        success:true,
        messsage:"Category Created Successfully",
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

// get allCategories handler function

exports.showAllCategories = async(req,res)=>{
    try{
        const allCategories = await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All categories returned successfully",
            allCategories,
        })


    }
    catch(error){
        return res.status(500).json({
            sucess:false,
            message:error.message,
        })
    }
}

// category page details

exports.categoryPageDetails = async(req,res)=>{
    try{
        // get categortId
        const {categoryId}=req.body;

        // get courses for specified catgoryId
            const selectedCategory = await Category.findById(categoryId).populate("course").exec();
        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found"
,            });
        }


        // get course for different catgory
        const differentCategories = await Category.find({_id:{$ne:categoryId},}).populate("courses").exec();


        // get top 10 selling course
        // HW write it on your own


        // return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        });

    }
    catch(error){
         console.log(error);
        return res.status(500).json({
            success:true,
            message:error.message,

    });
    }

}