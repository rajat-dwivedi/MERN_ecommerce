const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");

//Register a user
exports.registerUser = catchAsyncError(async (req,res,next)=>{
    const {name, email,password} = req.body
    const user = await User.create({
        name, 
        email,
        password,
        avatar:{
            public_id:"sample id",
            url : "profile url"
        }
    });

    sendToken(user,201,res); 
})

//login user
exports.loginUser = catchAsyncError(async (req,res,next)=>{
    const {email, password} = req.body;
    //checking if email password are both given
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400))
    }

    //we are writing + password since we have made password = false when doing the find() in user
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password"))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);
})

//logout user
exports.logout = catchAsyncError(async(req,res,next)=>{

    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message: "logged out"
    })
})
