const catchAsyncError = require("../middlewares/catchAsyncError");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");

// create new order api/v1/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

//get single order api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler(`order not found with id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get login user order api/v1/myorders
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const order = await Order.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    order,
  });
});

//Admin: Get All orders api/v1/orders
exports.orders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    totalAmount,
    success: true,
    orders,
  });
});

// Admin: Update Order / Order Status - api/v1/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found!", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order has already been delivered!", 400));
  }

  // Updating the product stock of each order item
  for (let orderItem of order.orderItems) {
    await updateStock(orderItem.product, orderItem.quantity);
  }

  // Update the order status
  order.orderStatus = req.body.orderStatus;

  // Set delivery timestamp if the status is 'Delivered'
  if (req.body.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
  });
});

//Admin: Delete Order - api/v1/ordedr/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found!", 404));
  }
  await order.deleteOne();
  res.status(200).json({
    success: true,
  });
});

// Function to update product stock
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler("Product not found!", 404);
  }

  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}
