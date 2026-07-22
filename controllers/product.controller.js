import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { applyQueryPipeline } from "../utils/queryHelper.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get all products with advanced filtering, searching, sorting, and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  logger.info("Fetching products list with query params: " + JSON.stringify(req.query));
  
  // Search fields allowed: name, description, brand
  const searchFields = ["name", "description", "brand"];
  
  const result = await applyQueryPipeline(Product, req.query, searchFields);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Products fetched successfully."));
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching product by ID: ${id}`);

  const product = await Product.findById(id)
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug")
    .lean();

  if (!product) {
    throw new ApiError(404, `Product with ID ${id} not found.`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully."));
});
