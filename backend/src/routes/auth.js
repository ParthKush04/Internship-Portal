import { Router } from "express";
import { loginUser, registerUser, googleAuth, getMe, updateProfile, uploadAvatar, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";
import {
	googleAuthValidationRules,
	handleValidationErrors,
	loginValidationRules,
	registerValidationRules,
	requireUploadedFile
} from "../middleware/validationMiddleware.js";

const router = Router();

console.log("🔐 Auth routes loaded and mounted at /api/auth");

router.post("/register", registerValidationRules, handleValidationErrors, registerUser);
router.post("/login", loginValidationRules, handleValidationErrors, loginUser);
router.post("/google", googleAuthValidationRules, handleValidationErrors, googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get('/ping', (_req, res) => res.json({ ok: true, route: '/api/auth/ping' }));
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post(
	"/upload-avatar",
	protect,
	uploadAvatarMiddleware,
	requireUploadedFile("avatar", "Avatar image is required"),
	uploadAvatar
);

export default router;
