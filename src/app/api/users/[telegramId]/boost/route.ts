import { connectToDatabase } from "@/lib/mongodb";
import { boosters } from "@/lib/static-data";
import { NextResponse } from "next/server";
import { ActiveBoosts, BoosterCooldowns, User } from "@/lib/types";

// Helper function to calculate the upgrade cost for progressive boosters
const calculateUpgradeCost = (currentLevel: number): number => {
  return Math.floor(2 * Math.pow(1.5, currentLevel));
};

// Helper function to calculate the new multiplier for the progressive booster
const calculateMultiplier = (level: number): number => {
  return 1 + 0.05 * level;
};

// Helper function to generate a random multiplier for the "fortune" booster
const getRandomMultiplier = (): number => {
  return Math.random() * (3 - 1) + 1; // Random multiplier between 1x and 3x
};

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

    if (!user.isMining && boosterId !== "power") {
      return NextResponse.json(
        { success: false, error: "Mining not started yet" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const booster = boosters.find((b) => b.id === boosterId);

    if (!booster) {
      return NextResponse.json(
        { success: false, error: "Invalid booster" },
        { status: 400 }
      );
    }

    let newScore = user.score;
    let updatedActiveBoosts: ActiveBoosts = { ...user.activeBoosts };
    let updatedBoosterCooldowns: BoosterCooldowns = {
      ...user.boosterCooldowns,
    };
    let cooldownExpiresAt = now;

    // Handle "Upgrade mining speed" (progressive) booster
    if (boosterId === "power") {
      const userBoosterLevel = user.activeBoosts?.power?.level || 0;
      const upgradeCost = calculateUpgradeCost(userBoosterLevel);

      if (user.score < upgradeCost) {
        return NextResponse.json(
          { success: false, error: "Insufficient score for upgrade" },
          { status: 400 }
        );
      }

      const newMultiplier = calculateMultiplier(userBoosterLevel + 1);
      updatedActiveBoosts = {
        ...updatedActiveBoosts,
        power: {
          level: userBoosterLevel + 1,
          multiplier: newMultiplier,
        },
      };

      newScore -= upgradeCost;
    }
    // Handle "Wheel of Fortune" booster
    else if (boosterId === "fortune") {
      const randomMultiplier = getRandomMultiplier();
      updatedActiveBoosts = {
        ...updatedActiveBoosts,
        fortune: {
          multiplier: randomMultiplier,
          expiresAt: now + (booster.activeDuration ?? 0), // Active for set duration
        },
      };
    }
    // Handle standard boosters with cooldown and active time
    else {
      // Check if booster is on cooldown
      if (
        user.boosterCooldowns?.[boosterId]?.expiresAt &&
        user.boosterCooldowns?.[boosterId]?.expiresAt > now
      ) {
        return NextResponse.json(
          { success: false, error: "Booster is on cooldown" },
          { status: 400 }
        );
      }

      // Deduct cost from score
      newScore -= booster.cost;
      if (newScore < 0) {
        return NextResponse.json(
          { success: false, error: "Insufficient score" },
          { status: 400 }
        );
      }

      // Add active boost
      updatedActiveBoosts = {
        ...updatedActiveBoosts,
        [boosterId]: {
          multiplier: booster.multiplier,
          expiresAt: now + (booster.activeDuration ?? 0),
        },
      };

      // Add/update cooldown
      cooldownExpiresAt =
        now + (booster.activeDuration ?? 0) + (booster.cooldownDuration ?? 0);
      updatedBoosterCooldowns = {
        ...updatedBoosterCooldowns,
        [boosterId]: {
          expiresAt: cooldownExpiresAt,
        },
      };
    }

    // Update user in the database
    const result = await db.collection("telegramUsers").updateOne(
      { telegramId },
      {
        $set: {
          score: newScore,
          activeBoosts: updatedActiveBoosts,
          boosterCooldowns: updatedBoosterCooldowns,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update user data");
    }

    return NextResponse.json({
      success: true,
      boosterId,
      boosterName: booster.name,
      multiplier:
        boosterId === "power"
          ? updatedActiveBoosts.power.multiplier
          : booster.multiplier,
      expiresAt:
        boosterId === "power" ? null : now + (booster.activeDuration ?? 0),
      cooldownExpiresAt: boosterId === "power" ? null : cooldownExpiresAt,
      level: boosterId === "power" ? updatedActiveBoosts.power.level : null,
    });
  } catch (error) {
    console.error("Error in boost API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
