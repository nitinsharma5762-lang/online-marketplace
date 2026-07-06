import express from "express";
import cors from "cors";
import router from "./routes/user.routes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", router);


// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Marketplace API is Running..."
  });
});

export default app;