const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Max length is 30"],
    minLength: [2, "Cannot use single char as name"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
    minLength: [5, "password should be atleast 5 char long"],
    //password should not be sent in find() call
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//using function decleartion here and not arrow since arrow functions do not have this keyword
userSchema.pre("save", async function (next) {
  //in case the user is changing the username or image and not updating the password then no need to encrypt the already encrypted password just move forward
  if (!this.isModified("password")) {
    next();
  }
  //in case password is modified then hash it before saving
  this.password = await bcrypt.hash(this.password, 10);
});

//JWT token
userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

//compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//generating password reset token
userSchema.methods.getResetPasswordToken = function () {
  //generating tokens
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hashing and adding getResetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .hash("sha256")
    .update(resetToken)
    .digest("hex");
  //giving 15 minutes before the token expires
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
