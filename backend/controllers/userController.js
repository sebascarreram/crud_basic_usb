// import User from "../models/userModel.js";
const User = require("../models/userModel.js");
const AppError = require("./../utils/appError.js");
const catchAsync = require("./../utils/catchAsync.js");

////////
// GET ALL USERS -> GET method
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    return next(new AppError("There is not users yet", 404));
  }
  // status 200 is succeeded
  res.status(200).json({
    status: "Success",
    results: users.length,
    data: { users },
  });
});

////////
// GET USER BY ID -> GET method
exports.getUser = catchAsync(async (req, res, next) => {
  // console.log(req.params.id) // OK

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`No user found with that ID: ${req.params.id}`, 404)
    );
  }

  // status 200 is succeeded
  res.status(200).json({
    status: "Success found",
    data: { user },
  });
});

//////
// Create a user -> POST method
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: "Created user successfully",
    data: {
      user: newUser,
    },
  });
});

//////
// Only for administrator to update all of the users data
// Update a user by id -> PATCH method
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new AppError(`No user found with that ID: ${req.params.id}`, 404)
    );
  }

  // status 200 is success
  res.status(200).json({
    status: "Success",
    data: {
      user,
    },
  });
});

//////
// Delete a user by id -> DELETE method
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(
      new AppError(`No user found with that ID: ${req.params.id}`, 404)
    );
  }
  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: "Deleted success",
    data: null,
  });
});
