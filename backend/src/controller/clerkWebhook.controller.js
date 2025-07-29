import { User } from "../models/user.model.js";

export const handleClerkWebhook = async (req, res, next) => {
  try {
    const { body } = req;

    // Clerk webhook sends an array of events
    if (!Array.isArray(body)) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    for (const event of body) {
      if (event.type === "user.created" || event.type === "user.updated") {
        const clerkUser = event.data;

        if (!clerkUser.id) {
          continue;
        }

        // Upsert user in backend database
        await User.findOneAndUpdate(
          { clerkId: clerkUser.id },
          {
            fullName: clerkUser.fullName || "Unknown",
            imageUrl: clerkUser.profileImageUrl || "",
            clerkId: clerkUser.id,
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    next(error);
  }
};
