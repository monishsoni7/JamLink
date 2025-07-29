import { Router } from "express";
import { handleClerkWebhook } from "../controller/clerkWebhook.controller.js";

const router = Router();

router.post("/webhook", handleClerkWebhook);

export default router;
