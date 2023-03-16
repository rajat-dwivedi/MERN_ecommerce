const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")


exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    //error in req.cookies
    console.log(req.cookies)
    if(!token)
    {return next(new ErrorHandler("Please login to access",401))}
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id);

    next();
})

exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        // console.log(req.user)
        // if(!roles.includes(req.user.role)){
        //     return next(new ErrorHandler(`Role :${req.user.role} is not allowed to access`,403))
        // }

        next();
    }
}