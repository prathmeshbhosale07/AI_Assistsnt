import express from "express";
import * as authMiddleware from "../middleware/authMiddleware.js";
import * as chatController from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", authMiddleware.protect, chatController.sendMessage);
router.get("/history", authMiddleware.protect, chatController.getHistory);
router.delete("/session/:id", authMiddleware.protect, chatController.deleteSession);

export default router;