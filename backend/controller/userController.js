const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")

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
        return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);
})

//logout user
exports.logout = catchAsyncError(async(req,res,next)=>{

    //this means putting the value null inside the "token" keyword
    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message: "logged out"
    })
})

exports.forgotPassword = catchAsyncError( async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    //getting reset password token 
    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is: ${resetPasswordUrl}`

    try{
        await sendEmail({
            email : user.email,
            subject : "Shopsite Password recovery",
            message
        })

        res.status(200).json({
            success:true,
            mesasge : "email sent to user successfully"
        })
    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500)) 
    }
})

//reset password
exports.resetPassword = catchAsyncError( async (req,res,next)=>{

    //creating token hash
    const resetPasswordToken = crypto
    .hash("sha256")
    //since the resetpassword link that we sent to the user will contain the token as a parameter
    //we will extract it from the req
    .update(req.params.token)
    .digest("hex");

    //searching the user in our database using the hashed token
    const user = await User.findOne({
        resetPasswordToken,
        //the token must not have expired
        resetPasswordExpire : {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Token invalid or expired", 400));
    }

    if(req.body.password !== req.body.confirmedPassword){
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.password
    user.resetPasswordExpire = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
})