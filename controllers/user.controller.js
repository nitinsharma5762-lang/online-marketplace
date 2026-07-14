import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from  "nodemailer";

export const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check existing user
    const existingUser = await userModel.findOne({
      $or: [
        { u_email: email },
        { u_mobile: mobile }
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
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

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        uuid: user.uuid,
        name: user.u_name,
        email: user.u_email,
        mobile: user.u_mobile,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // Find User
    const user = await userModel.findOne({ u_email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check Verification
    if (!user.u_isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your account first.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.u_password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT Token
    const token = jsonwebtoken.sign(
      {
        id: user._id,
        uuid: user.uuid,
        role: user.u_role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        uuid: user.uuid,
        name: user.u_name,
        email: user.u_email,
        mobile: user.u_mobile,
        role: user.u_role,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    console.log("========== SEND OTP API ==========");

    const { email } = req.body;
    console.log("Request Body:", req.body);

    if (!email) {
      console.log("Email not received");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("Searching User:", email);

    const user = await userModel.findOne({ u_email: email });

    console.log("User Found:", user);

    if (!user) {
      console.log("User Not Found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Generated OTP:", otp);

    // Save OTP
    user.u_otp = otp;
    user.u_otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log("Before Save:");
    console.log("u_otp =", user.u_otp);
    console.log("u_otpExpiry =", user.u_otpExpiry);

    const savedUser = await user.save();

    console.log("After Save:");
    console.log(savedUser);

    // Fetch Again
    const dbUser = await userModel.findOne({ u_email: email });

    console.log("Fetched From DB:");
    console.log(dbUser);
    console.log("DB OTP:", dbUser.u_otp);
    console.log("DB OTP Expiry:", dbUser.u_otpExpiry);

    // Email Transport
    console.log("Creating Transporter...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Sending Email...");

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

    console.log("Email Sent Successfully");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("========== ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Email:", email);
    console.log("OTP Received:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await userModel.findOne({ u_email: email });

    console.log("User:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("DB OTP:", user.u_otp);
    console.log("DB OTP Expiry:", user.u_otpExpiry);

    if (user.u_otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (!user.u_otpExpiry || user.u_otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    user.u_isVerified = true;
    user.u_otp = null;
    user.u_otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const changePassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Find User
    const user = await userModel.findOne({ u_email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password
    user.u_password = hashedPassword;

    // Optional: Clear OTP fields
    user.u_otp = null;
    user.u_otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};