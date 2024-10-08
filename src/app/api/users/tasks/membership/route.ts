import { connectToDatabase } from "@/lib/mongodb";
import { TelegramResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { userId, chatId, taskId, points } = await request.json();
    if (!userId || !chatId || !taskId || !points) {
      return NextResponse.json(
        { error: "Missing userId, chatId, taskId or points" },
        { status: 400 }
      );
    }

    // Fetch membership status from Telegram API
    const response = await fetch(`${TELEGRAM_API_BASE}/getChatMember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    });

    const data: TelegramResponse = await response.json();
    // console.log("Telegram API response:", data);

    if (data.ok && data.result) {
      const isMember = ["creator", "administrator", "member"].includes(
        data.result.status
      );

      if (isMember) {
        const { db } = await connectToDatabase();

        // Update the user with the new task ID in the database
        const updateResult = await db
          .collection("telegramUsers")
          .updateOne(
            { telegramId: userId },
            { $addToSet: { tasks: taskId }, $inc: { score: points } }
          );

        if (updateResult.matchedCount === 0) {
          return NextResponse.json(
            { error: "User not found, task not added" },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true, isMember });
      } else {
        return NextResponse.json(
          { success: false, error: "User is not a member" },
          { status: 403 }
        );
      }
    } else {
      console.error("Telegram API error:", data.description);
      return NextResponse.json(
        { error: data.description || "Failed to check membership" },
        { status: data.error_code || 400 }
      );
    }
  } catch (error) {
    console.error("Error checking Telegram membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
