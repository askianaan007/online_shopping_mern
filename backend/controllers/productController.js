const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAssyncError = require("../middlewares/catchAsyncError");
const APIFeatures = require("../utils/apiFeatures");

//get all products -api/v1/products -> get
exports.getProducts = async (req, res, next) => {
  const resPerPage = 2;
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .paginate(resPerPage);
  const products = await apiFeatures.query;
  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
};

//create product - /api/v1/product/new -> post
exports.newProduct = catchAssyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// get single data - api/v1/product/:id -> get
exports.getSingleProduct = catchAssyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 400));
  }
  res.status(201).json({
    success: true,
    product,
  });
});

//update product api/v1/product/:id -> put
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    message: "product updated",
    product,
  });
};

//delete product api/v1/product/:id -> delete
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "product deleted successfully",
  });
};

//Create Review - api/v1/review
exports.createReview = catchAssyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user.id,
    rating,
    comment,
  };

  const product = await Product.findById(productId);

  //finding user review exists
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });

  if (isReviewed) {
    //updating the  review
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //creating the review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //find the average of the product reviews

  product.ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;
  product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//get reviews api/v1/reviews {{base_url}}/api/v1/reviews?id={}
exports.getReviews = catchAssyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 401));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete Review api/v1/review
exports.deleteReview = catchAssyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("product not found", 401));
  }

  // filtering the review which is does not match the deleteing review id
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString();
  });

  //number of reviews and find avg rating
  const numOfReviews = reviews.length;
  let ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / reviews.length;
  ratings = isNaN(ratings) ? 0 : ratings;

  //save the product
  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });

  res.status(200).json({
    success: true,
  });
});
