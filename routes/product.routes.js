import express from "express";
import {
  getProducts,
  getProductById,
} from "../controllers/product.controller.js";

const router = express.Router();

// Public routes for product querying and details
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);

export default router;
