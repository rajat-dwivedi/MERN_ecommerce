const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');

//Create product -- admin
exports.createProduct = catchAsyncError(async(req, res, next)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        success : true,
        product
    })
});

//get all products
exports.getAllProducts = catchAsyncError(async (req,res)=>{
    const resPerPage = 5;
    const productCount = await Product.countDocuments()
    const apifeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resPerPage)
    const product = await apifeature.query;
    res.status(200).json({
        success : true,
        product,
        productCount
    })
})

//get single product
exports.getProductDetails = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("product not found",404));
    }
    res.status(200).json({
        success:true,
        product
    })
})

//update products -- admin 
exports.updateProduct = catchAsyncError(async(req, res) =>{
    let product = Product.findById(req.params.id)
    if(!product){
        return res.status(500).json({
            success:false,
            message : "Product not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new : true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success : true,
        product
    })
})

//delete a product
exports.deleteProduct = catchAsyncError(async (req,res,next)=>{
    const product = await Product.findById(req.params.id)
    //if no product is found i.e. invalid id is given
    if(!product){
        res.status(500).json({
            success:false,
            message:"invalid product"
        })
    }

    //used deleteOne instead of deprecated .remove()
    await product.deleteOne()

    res.status(200).json({
        success:true,
        message:"Product deleted"
    })
})