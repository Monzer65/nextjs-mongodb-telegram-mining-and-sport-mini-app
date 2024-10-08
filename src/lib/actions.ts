"use server";

import { connectToDatabase } from "@/lib/mongodb";

export async function storeUserData(userData: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
}) {
  try {
    const { db } = await connectToDatabase();

    const existingUser = await db
      .collection("telegramUsers")
      .findOne({ id: userData.id });

    if (existingUser) {
      // Update existing user
      await db.collection("telegramUsers").updateOne(
        { id: userData.id },
        {
          $set: {
            ...userData,
            last_updated: new Date(),
          },
        }
      );
    } else {
      // Create new user
      await db.collection("telegramUsers").insertOne({
        ...userData,
        created_at: new Date(),
        last_updated: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error storing user data:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
