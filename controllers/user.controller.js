import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from "nodemailer";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  logger.info(`Processing registration request for email: ${email}`);

  // Validation
  if (!name || !email || !mobile || !password) {
    throw new ApiError(400, "All fields are required.");
  }

  // Check existing user
  const existingUser = await userModel.findOne({
    $or: [{ u_email: email }, { u_mobile: mobile }],
  }).lean();

  if (existingUser) {
    throw new ApiError(400, "User already exists.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const user = await userModel.create({
    u_name: name,
    u_email: email,
    u_mobile: mobile,
    u_password: hashedPassword,
    u_isVerified: false,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        uuid: user.u_uuid,
        name: user.u_name,
        email: user.u_email,
        mobile: user.u_mobile,
      },
      "Registration successful."
    )
  );
});

/**
 * @desc    Login user & generate JWT
 * @route   POST /api/v1/users/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.info(`Processing login request for email: ${email}`);

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required.");
  }

  // Find User
  const user = await userModel.findOne({ u_email: email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Check Verification
  if (!user.u_isVerified) {
    throw new ApiError(400, "Please verify your account first.");
  }

  // Compare Password
  const isMatch = await bcrypt.compare(password, user.u_password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Generate JWT Token
  const token = jsonwebtoken.sign(
    {
      id: user._id,
      uuid: user.u_uuid,
      role: user.u_role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          uuid: user.u_uuid,
          name: user.u_name,
          email: user.u_email,
          mobile: user.u_mobile,
          role: user.u_role,
        },
      },
      "Login successful."
    )
  );
});

/**
 * @desc    Generate and send verification OTP email
 * @route   POST /api/v1/users/sendotp
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  logger.info(`Sending verification OTP to: ${email}`);

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await userModel.findOne({ u_email: email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP
  user.u_otp = otp;
  user.u_otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await user.save();

  // Email Transport setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  logger.info(`Dispatching email transport to: ${email}`);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  });

  return res.status(200).json(
    new ApiResponse(200, null, "OTP sent successfully.")
  );
});

/**
 * @desc    Verify verification OTP
 * @route   POST /api/v1/users/verify/otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  logger.info(`Verifying OTP for: ${email}`);

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await userModel.findOne({ u_email: email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.u_otp !== otp) {
    throw new ApiError(400, "Invalid OTP.");
  }

  if (!user.u_otpExpiry || user.u_otpExpiry < new Date()) {
    throw new ApiError(400, "OTP has expired.");
  }

  user.u_isVerified = true;
  user.u_otp = null;
  user.u_otpExpiry = null;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, null, "OTP verified successfully.")
  );
});

/**
 * @desc    Change account password
 * @route   PUT /api/v1/users/change-password
 * @access  Public (or authenticated depending on design, matching previous public format)
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  logger.info(`Changing password request for: ${email}`);

  // Validation
  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required.");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  // Find User
  const user = await userModel.findOne({ u_email: email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Hash New Password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update Password
  user.u_password = hashedPassword;
  user.u_otp = null;
  user.u_otpExpiry = null;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Password changed successfully.")
  );
});