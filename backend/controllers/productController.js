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
