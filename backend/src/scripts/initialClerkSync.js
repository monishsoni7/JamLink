import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { User } from "../models/user.model.js";

dotenv.config();

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!CLERK_API_KEY) {
  console.error("CLERK_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in environment variables");
  process.exit(1);
}

const clerkApiUrl = "https://api.clerk.com/v1/users";

async function fetchClerkUsers() {
  let users = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await fetch(`${clerkApiUrl}?limit=${limit}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${CLERK_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Clerk users: ${response.statusText}`);
    }

    const data = await response.json();

    // Debug log to check response structure
    console.log("Clerk API response data:", data);

    if (!Array.isArray(data)) {
      throw new Error("Unexpected Clerk API response format");
    }

    users = users.concat(data);

    if (data.length < limit) {
      break;
    }
    page++;
  }

  return users;
}

async function upsertUsers(users) {
  for (const clerkUser of users) {
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

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await fetchClerkUsers();
    console.log(`Fetched ${users.length} users from Clerk`);

    await upsertUsers(users);
    console.log("Upserted users into MongoDB");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error during initial Clerk sync:", error);
    process.exit(1);
  }
}

main();
