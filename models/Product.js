import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const productSchema = new mongoose.Schema(
  {
    // Unique Product ID
    productId: {
      type: String,
      default: uuidv4,
      unique: true,
    },

    // Seller/User UUID
    userId: {
      type: String,
      required: true,
    },

    // Product Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Product Description
    description: {
      type: String,
      default: "",
    },

    // Product Category
    categoryId: {
      type: String,
      required: true,
    },

    // Brand
    brand: {
      type: String,
      default: "",
    },

    // Selling Price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Original Price (Optional)
    originalPrice: {
      type: Number,
      default: 0,
    },

    // Available Stock
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Product Images
    images: [
      {
        type: String,
      },
    ],

    // Product SKU
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Approval Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Availability
    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "in_stock",
    },

    // Featured Product
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Product Active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Rating
    ratings: {
      type: Number,
      default: 0,
    },

    // Total Reviews
    reviewsCount: {
      type: Number,
      default: 0,
    },

    // Total Sold
    totalSold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);