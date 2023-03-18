const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//Create product -- admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

  //what is req.user.id?
  req.body.user = req.user.id   
   
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resPerPage = 5;
  const productCount = await Product.countDocuments();
  const apifeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage);
  const product = await apifeature.query;
  res.status(200).json({
    success: true,
    product,
    productCount,
  });
});

//get single product
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

//update products -- admin
exports.updateProduct = catchAsyncError(async (req, res) => {
  let product = Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//delete a product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  //if no product is found i.e. invalid id is given
  if (!product) {
    res.status(500).json({
      success: false,
      message: "invalid product",
    });
  }

  //used deleteOne instead of deprecated .remove()
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});

//create new review or update the review
exports.createReview = catchAsyncError(async (req,res,next)=>{
  const {rating, comment, productId} = req.body
  
  const review = {
      user : req.user._id,
      name : req.user.name,
      rating : Number(rating),
      comment
  }

  const product = await Product.findById(productId);

  //if the user id of a review matches the user id of the current user trying to review a product that means the user has already reviewed the product once 
  const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id)

  if(isReviewed){
      product.reviews.forEach(rev=>{
          if(rev.user.toString() === req.user._id){
              rev.rating = rating
              rev.comment = comment
          }
      })
  }else{
      await product.reviews.push(review)
      product.numOfReviews = product.reviews.length
  }

  let avg = 0;
  product.reviews.forEach(rev =>{
      avg+=rev.rating
  })
  product.ratings = avg/product.reviews.length

  await product.save({validateBeforeSave:false})

  res.status(200).json({
      success : true
  })
})

//get all reviews of a product
exports.getAllReviews = catchAsyncError(async (req,res,next)=>{
  const product = await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler("Invalid product id",404));
  }

  res.status(200).json({
    success : true,
    reviews : product.reviews
  })
})

exports.deleteReview = catchAsyncError (async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});