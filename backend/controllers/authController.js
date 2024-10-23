const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const crypto = require("crypto");

//register user {{base_url}}/api/v1/register POST
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  const token = user.getJwtToken();

  sendToken(user, 201, res);
});

//login user {{base_url}}/api/v1/login POST
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("please enter email and password", 400));
  }
  // finding user from databse
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("invalid email or password", 401));
  }

  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("invalid email or password", 401));
  }
  sendToken(user, 201, res);
});

//logout user {{base_url}}/api/v1/logout POST
exports.logout = (req, res, next) => {
  res
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "logout successfully",
    });
};

//forgot password {{base_url}}/api/v1/password/forgot POST
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });

  // create reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/${resetToken}`;

  const message = `your password reset url is as follows \n\n
  ${resetUrl} \n\n
  if not requested this mail please ignore it
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Online cart password recovery",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: ` Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

// reset password {{base_url}}/api/v1/password/reset/:token POST
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("password reset token is invalid or expired", 401)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 401));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 201, res);
});

//get user profile {{base_url}}/api/v1/myprofile GET
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// change password {{base_url}}/api/v1/password/change PUT
exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const password = req.body.oldPassword;

  // check old password
  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }
  // assigning new password
  user.password = req.body.password;
  await user.save();
  res.status(200).json({
    success: true,
  });
});

//update profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: get All user  {{base_url}}/api/v1/admin/users
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//Admin: get specific user  {{base_url}}/api/v1/admin/user/:id
exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user not found with this id: ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: Update specific user  {{base_url}}/api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: Delete User {{base_url}}/api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user not found with this id: ${req.params.id}`)
    );
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
  });
});
