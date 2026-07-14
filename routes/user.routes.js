
import express from "express";
import { login, register,sendOtp,verifyOtp, changePassword} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/sendotp",sendOtp);
router.post("/verify/otp", verifyOtp);
router.put("/change-password", changePassword);

export default router;