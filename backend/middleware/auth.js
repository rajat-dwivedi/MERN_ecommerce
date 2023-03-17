const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")


exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    // console.log(token)

    //if the user is not logged in that means the token is not available
    if(!token)
    {return next(new ErrorHandler("Please login to access",401))}
    
    const decodedData  = jwt.verify(token, process.env.JWT_SECRET)

    //this will put the decodedData id into the req.user that means as long as the user is logged in we can access its data
    req.user = await User.findById(decodedData.id);
    // console.log(req.user)

    next();
})

exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        // console.log(req.user)
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role :${req.user.role} is not allowed to access`,403))
        }

        next();
    }
}