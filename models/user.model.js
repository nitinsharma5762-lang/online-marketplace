import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
   u_uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      immutable: true,
    },

    u_name: {
      type: String,
      required: true,
      trim: true,
    },

    u_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    u_mobile: {
      type: String,
      required: true,
      unique: true,
    },

   u_password: {
      type: String,
      required: true,
    },

   u_role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

   u_isVerified: {
      type: Boolean,
      default: false,
    },

   u_otp: {
      type: String,
      default: null,
    },

   u_otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);