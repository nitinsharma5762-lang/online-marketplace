import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

/**
 * Global Express Error Handling Middleware.
 * Standardizes all error responses and logs stack traces.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of our custom ApiError, standardize it
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Log error using Winston logger
  logger.error(
    `[${req.method}] ${req.url} - Status: ${error.statusCode} - Error: ${error.message} - Stack: ${error.stack}`
  );

  // Send clean response to the client
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
