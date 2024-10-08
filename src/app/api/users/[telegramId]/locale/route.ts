import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const telegramId = Number(params.telegramId);

    // Connect to the database
    const { db } = await connectToDatabase();

    // Parse the request body to get the locale
    const { locale } = await request.json();

    // Validate the locale (assuming `locales` is a predefined set of valid locales)
    const validLocales = ["en", "fa", "ckb"]; // You can replace this with your i18n configuration
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { success: false, error: "Invalid locale" },
        { status: 400 }
      );
    }

    // Fetch the user by telegramId
    const user = await db.collection("telegramUsers").findOne({ telegramId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user's locale
    const result = await db
      .collection("telegramUsers")
      .updateOne({ telegramId }, { $set: { locale } });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update user locale" },
        { status: 500 }
      );
    }

    // Respond with success
    return NextResponse.json(
      { success: true, message: "Locale updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating locale:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
