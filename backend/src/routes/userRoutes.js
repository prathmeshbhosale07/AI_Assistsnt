import express from "express";
import * as authMiddleware from "../middleware/authMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, userController.getMe);
router.put("/preferences", authMiddleware.protect, userController.updatePreferences);

export default router;