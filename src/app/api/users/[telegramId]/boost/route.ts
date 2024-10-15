import { connectToDatabase } from "@/lib/mongodb";
import { boosters } from "@/lib/static-data";
import { NextResponse } from "next/server";
import { User } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const { boosterId } = await request.json();
    const telegramId = Number(params.telegramId);

    const { db } = await connectToDatabase();
    const user = (await db
      .collection("telegramUsers")
      .findOne({ telegramId })) as User;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const booster = boosters.find((b) => b.id === boosterId);
    if (!booster) {
      return NextResponse.json(
        { success: false, error: "Booster not found" },
        { status: 404 }
      );
    }

    // Initialize boosters field if it doesn't exist
    if (!user.boosters) {
      user.boosters = {
        power: { level: 0, multiplier: 1, lastUsed: new Date() },
        activeBoosters: [],
        cooldowns: {},
      };
    }

    // Check cooldown
    const lastUsed = user.boosters.cooldowns[boosterId];
    if (
      lastUsed &&
      Date.now() - new Date(lastUsed).getTime() <
        (booster.cooldownDuration || 0)
    ) {
      return NextResponse.json(
        { success: false, error: "Booster is on cooldown" },
        { status: 400 }
      );
    }

    // Check if user has enough score to activate the booster
    if (user.score < booster.cost) {
      return NextResponse.json(
        { success: false, error: "Insufficient score to activate booster" },
        { status: 400 }
      );
    }

    // Apply booster effects and reduce score accordingly
    switch (booster.id) {
      case "power":
        const nextLevel = user.boosters.power.level + 1;
        const upgradeCost =
          booster.cost *
          Math.pow(booster.upgradeCostFactor || 1.1, nextLevel - 1);

        if (nextLevel <= (booster.maxLevel || Infinity)) {
          if (user.score < upgradeCost) {
            return NextResponse.json(
              {
                success: false,
                error: "Insufficient score to upgrade power booster",
              },
              { status: 400 }
            );
          }
          user.boosters.power.level = nextLevel;
          user.boosters.power.multiplier =
            1 + booster.speedIncrement! * nextLevel;
          user.boosters.power.lastUsed = new Date();
          user.score -= upgradeCost; // Deduct score after confirming upgrade
        } else {
          return NextResponse.json(
            { success: false, error: "Power booster already at max level" },
            { status: 400 }
          );
        }
        break;

      case "fortune":
        const fortuneMultiplier =
          typeof booster.multiplier === "function"
            ? booster.multiplier()
            : booster.multiplier;
        user.boosters.activeBoosters.push({
          id: booster.id,
          multiplier: fortuneMultiplier,
          expiresAt: new Date(Date.now() + (booster.activeDuration || 0)),
          lastUsed: new Date(),
        });
        user.score -= booster.cost; // Deduct score for fortune booster
        break;

      case "speed":
        // Update weekly streak
        const now = new Date();
        const daysSinceLastStreak =
          (now.getTime() - new Date(user.lastStreakUpdate).getTime()) /
          (1000 * 60 * 60 * 24);
        user.weeklyStreak =
          daysSinceLastStreak > 7
            ? 1
            : daysSinceLastStreak > 1 && daysSinceLastStreak <= 2
            ? user.weeklyStreak + 1
            : 1;
        user.lastStreakUpdate = now;

        const speedMultiplier = Math.min(8, 1 + user.weeklyStreak * 0.5); // Max 8x multiplier
        user.boosters.activeBoosters.push({
          id: booster.id,
          multiplier: speedMultiplier,
          expiresAt: new Date(Date.now() + (booster.activeDuration || 0)),
          lastUsed: now,
        });
        user.score -= booster.cost; // Deduct score for speed booster
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unsupported booster type" },
          { status: 400 }
        );
    }

    // Update cooldown
    user.boosters.cooldowns[boosterId] = new Date();

    // Remove expired boosters
    user.boosters.activeBoosters = user.boosters.activeBoosters.filter(
      (b) => new Date(b.expiresAt!) > new Date()
    );

    // Update user in the database
    await db.collection<User>("telegramUsers").updateOne(
      { telegramId },
      {
        $set: {
          score: user.score,
          boosters: user.boosters,
          weeklyStreak: user.weeklyStreak,
          lastStreakUpdate: user.lastStreakUpdate,
        },
      }
    );

    // Return updated user data
    return NextResponse.json({
      success: true,
      message: "Booster activated successfully",
      user: {
        score: user.score,
        boosters: user.boosters,
        weeklyStreak: user.weeklyStreak,
        lastStreakUpdate: user.lastStreakUpdate,
      },
    });
  } catch (error) {
    console.error("Error activating booster:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
