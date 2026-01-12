import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    getMyConversations,
    getUnreadCount
} from "../controllers/message.controllers.js";

const router = Router();

router.use(verifyjwt); // Auth required for all chat routes

router.get("/conversations", getMyConversations);
router.get("/unread-count", getUnreadCount);
router.post("/conversation/:applicationId", getOrCreateConversation);
router.get("/:conversationId", getMessages);
router.post("/:conversationId/send", sendMessage);

export default router;
