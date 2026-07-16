import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: uuidv4,
      unique: true,
    },

    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    brand: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: [String],

    discount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);