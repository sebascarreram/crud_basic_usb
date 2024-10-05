// import mongoose from "mongoose";
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// It's a build-in node module so no need to install crypto
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must a NAME"],
      //   unique: true,
      trim: true,
      maxLength: [
        40,
        "A title name must have less or equal then 40 characters",
      ],
      minLength: [5, "A title name must have more or equal then 10 characters"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "A user must a email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A user must a password"],
      trim: true,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // this only works on CREATE and SAVE !
        validator: function (el) {
          return el === this.password; // abc === abc => true. abc === axy => false
        },
        message: "Passwords are not same",
      },
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // 1000 = 1 second
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current
  // this.find({ active: true });
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // If this field is null or undefined so won't run here
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp);
    // output: 020-03-01T00:00:00.000Z  1585692264

    // const changedTimestamp = this.passwordChangedAt.getTime();
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 583020800000 1585692264

    // const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 1583020800 1585692264

    // parseInt() -> Integer
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 1583020800 1585692264

    return JWTTimestamp < changedTimestamp;
    // 100 < 200 -> true
    // 300 < 200 -> false
    // -
    // False means NOT change
    // True means changed!
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  // { resetToken: 'here is original reset token which it's random Hex string } 'Go the encrypted here'
  // { resetToken: 'xxxxxxxx' } 'xxxxxxxxx'

  // To work for 10 minutes
  // + 10 milliseconds * 60 seconds * 1000 milliseconds
  // 20 * 60 * 1000
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // this.passwordResetExpires = new Date(new Date() + 10 * 60 * 1000);

  return resetToken;
};

// QUERY MIDDLEWARE

userSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

const User = mongoose.model("users", userSchema);

// export default User;
module.exports = User;
