// app/api/users/[telegramId]/boost/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import { boosters } from "@/lib/static-data";
import { BoosterId } from "@/lib/types";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const telegramId = Number(params.telegramId);
    const { db } = await connectToDatabase();
    const { boosterId }: { boosterId: BoosterId } = await request.json();

    if (!boosters[boosterId]) {
      return NextResponse.json(
        { success: false, error: "Invalid booster" },
        { status: 400 }
      );
    }

    const user = await db.collection("telegramUsers").findOne({ telegramId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const now = Date.now();

    // Check if the booster is already active or in cooldown
    if (
      user.activeBoosts?.[boosterId] ||
      user.boosterCooldowns?.[boosterId] > now
    ) {
      return NextResponse.json(
        { success: false, error: "Booster is already active or in cooldown" },
        { status: 400 }
      );
    }

    // Check if user has enough tokens
    if (user.tokens < boosters[boosterId].cost) {
      return NextResponse.json(
        { success: false, error: "Not enough tokens" },
        { status: 400 }
      );
    }

    // Activate the booster
    const activeBoosts = { ...user.activeBoosts };
    activeBoosts[boosterId] = {
      multiplier: boosters[boosterId].multiplier,
      expiresAt: now + boosters[boosterId].duration * 1000,
    };

    const boosterCooldowns = { ...user.boosterCooldowns };
    boosterCooldowns[boosterId] = now + boosters[boosterId].cooldown * 1000;

    // Update only the relevant fields in user data
    await db.collection("telegramUsers").updateOne(
      { telegramId },
      {
        $set: {
          score: user.score - boosters[boosterId].cost,
          activeBoosts,
          boosterCooldowns,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          boosterId,
          duration: boosters[boosterId].duration,
          cooldown: boosters[boosterId].cooldown,
          score: user.score - boosters[boosterId].cost,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error activating booster:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
