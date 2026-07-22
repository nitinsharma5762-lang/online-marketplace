import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import routes from "./routes/index.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Trust Proxy (Required if deployed behind Nginx/Render/Heroku/AWS)
app.set("trust proxy", 1);

// Security Middleware (Helmet)
app.use(helmet());

// Rate Limiting (Throttling)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use(apiLimiter);

// Logging (Morgan redirected through Winston)
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Middleware
// Restrict CORS to a specific origin in production
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Change "*" to your actual frontend URL in production
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payload Compression (Gzip)
app.use(compression());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// API Routes
app.use("/api/v1", routes);

// Landing / Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Marketplace API is Running...",
  });
});

// 404 Fallback Handler
app.use(/./, (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;