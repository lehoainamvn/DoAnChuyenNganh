import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  getMessages,
  sendMessage,
  getOwnerRooms
} from "../controllers/message.controller.js";

const router = express.Router();

/* LẤY DANH SÁCH PHÒNG CÓ NGƯỜI THUÊ */
router.get(
  "/rooms",
  verifyToken,
  getOwnerRooms
);

/* LẤY TIN NHẮN THEO PHÒNG */
router.get(
  "/:roomId",
  verifyToken,
  getMessages
);

/* GỬI TIN NHẮN */
router.post(
  "/",
  verifyToken,
  sendMessage
);

export default router;