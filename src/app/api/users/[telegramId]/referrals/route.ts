import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const telegramId = Number(params.telegramId);
    const { db } = await connectToDatabase();

    const user = await db.collection("telegramUsers").findOne({ telegramId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const referrals = await db
      .collection("telegramUsers")
      .find({ referredBy: telegramId })
      .toArray();

    const formattedReferrals = referrals.map((ref) => ({
      telegramId: ref.telegramId,
      username: ref.username,
      joinDate: ref.createdAt.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      tokensEarned: 100,
    }));

    const totalTokensEarned = formattedReferrals.reduce(
      (sum, ref) => sum + ref.tokensEarned,
      0
    );

    return NextResponse.json(
      {
        success: true,
        referrals: formattedReferrals,
        totalTokensEarned,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching referrals data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
