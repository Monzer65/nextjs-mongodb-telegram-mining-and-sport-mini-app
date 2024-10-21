import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { telegramId: string } }
) {
  try {
    const telegramId = Number(params.telegramId);
    const { score } = await request.json();

    if (!telegramId || !score) {
      return NextResponse.json(
        { error: "Missing userId or score" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update the user's score in the database
    const updateResult = await db
      .collection("telegramUsers")
      .updateOne({ telegramId }, { $inc: { score: score / 1000 } });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
