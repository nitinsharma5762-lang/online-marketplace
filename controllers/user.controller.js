import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

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