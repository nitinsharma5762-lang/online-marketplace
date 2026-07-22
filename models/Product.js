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

    // Seller/User UUID (from user model)
    userId: {
      type: String,
      required: true,
    },

    // Product Name (e.g., "Tata Salt", "Fresh Tomatoes")
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

    // Product Category reference
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Optional Sub-category reference
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Brand name (e.g., "Amul", "Organic India")
    brand: {
      type: String,
      default: "",
      trim: true,
    },

    // Selling Price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Original Price / MRP
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Discount percentage (auto-calculated or set manually)
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Offer details/tags (e.g., "Buy 1 Get 1 Free", "Flat 10% Off")
    offerTag: {
      type: String,
      default: "",
      trim: true,
    },

    // Offer expiration date
    offerExpiresAt: {
      type: Date,
      default: null,
    },

    // Stock Quantity
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Measurement Units (kg, g, piece, l, ml, pack, etc.)
    unit: {
      type: String,
      enum: ["kg", "g", "piece", "l", "ml", "pack", "item"],
      required: true,
    },

    // Numerical value of the unit (e.g., 500 for "500 g", 1 for "1 kg")
    unitValue: {
      type: Number,
      required: true,
      min: 0.001,
    },

    // Display string for the unit (e.g., "500 g", "1 kg")
    unitText: {
      type: String,
      default: "",
      trim: true,
    },

    // Seasonal relevance (e.g., "summer" for mangoes, "winter" for carrots/festive)
    seasons: [
      {
        type: String,
        enum: ["summer", "monsoon", "winter", "spring", "festive", "all-season"],
        default: "all-season",
      },
    ],

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

    // Product Active Status
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

    // Nutrition facts / Key ingredients (useful for Blinkit/Zepto/Instamart food products)
    highlights: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unitText and calculate discount percentage
productSchema.pre("save", function () {
  // Format unitText (e.g. "500 g" or "1 kg") if not explicitly set
  if (this.unit && this.unitValue && !this.unitText) {
    this.unitText = `${this.unitValue} ${this.unit}`;
  }

  // Calculate discount percentage automatically if originalPrice is valid
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discountPercentage = 0;
  }

  // Update availability based on stock
  if (this.stock === 0) {
    this.availability = "out_of_stock";
  } else {
    this.availability = "in_stock";
  }
});

export default mongoose.model("Product", productSchema);