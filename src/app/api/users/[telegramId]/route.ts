// app/api/users/[telegramId]/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { boosters } from "@/lib/static-data";
import { User } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const levelThresholds = [
  0, // Level 1
  10, // Level 2
  100, // Level 3
  2000, // Level 4
  5000, // Level 5
  10000, // Level 6
  50000, // Level 7
  100000, // Level 8
  200000, // Level 9
  500000, // Level 10
];

export async function GET(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
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

    const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const now = Date.now();
    const lastMiningStart = user.lastMiningStart ?? 0;
    const timeElapsed = lastMiningStart ? now - lastMiningStart : 0;
    const cappedTimeElapsed = Math.min(timeElapsed, FOUR_HOURS);

    // Default mining speed
    let totalScore = 0;
    let remainingTime = cappedTimeElapsed;
    const defaultMiningSpeed = user.miningSpeed;

    // Add the permanent power booster's multiplier to the default speed
    const powerMultiplier = user.boosters.power.multiplier;
    const baseEffectiveSpeed = defaultMiningSpeed + powerMultiplier;

    // Remove expired cooldowns
    const currentTimestamp = Date.now();
    for (const [id, lastUsed] of Object.entries(user.boosters.cooldowns)) {
      const boosterData = boosters.find((b) => b.id === id);
      if (
        boosterData &&
        currentTimestamp - new Date(lastUsed).getTime() >=
          (boosterData.cooldownDuration || 0)
      ) {
        delete user.boosters.cooldowns[id]; // Remove expired cooldown
      }
    }

    // Calculate score contribution from each active booster
    for (const booster of user.boosters.activeBoosters) {
      const cooldown = user.boosters.cooldowns[booster.id];

      if (!cooldown && booster.expiresAt) {
        // Calculate time with the booster
        const boosterDuration = Math.min(
          remainingTime,
          booster.expiresAt.getTime() - booster.lastUsed.getTime()
        );

        if (boosterDuration > 0) {
          // Apply booster multiplier
          const boostedSpeed = baseEffectiveSpeed * booster.multiplier;
          totalScore += (boosterDuration * 0.001 * boostedSpeed) / 1000;
          remainingTime -= boosterDuration;
        }
      }

      // Exit loop if all time is accounted for
      if (remainingTime <= 0) break;
    }

    // Add remaining time at the default effective speed
    if (remainingTime > 0) {
      totalScore += (remainingTime * 0.001 * baseEffectiveSpeed) / 1000;
    }

    // Calculate new score
    const newScore = user.score + totalScore;

    // Determine level based on new score
    let level = 1; // Default to level 1
    for (let i = 0; i < levelThresholds.length; i++) {
      if (newScore >= levelThresholds[i]) {
        level = i + 1; // Levels are 1-indexed
      } else {
        break;
      }
    }

    // Update user's score if the mining session is complete
    if (cappedTimeElapsed >= FOUR_HOURS && user.isMining) {
      const updatedUser = {
        ...user,
        score: newScore,
        level,
        isMining: false,
        lastMiningStart: 0,
      };

      // Update user data in the database
      await db
        .collection("telegramUsers")
        .updateOne({ telegramId }, { $set: updatedUser });

      return NextResponse.json(
        { success: true, user: updatedUser },
        { status: 200 }
      );
    }

    // If the mining session is still ongoing or no update is needed:
    return NextResponse.json(
      { success: true, user: { ...user, level } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const { name, username, startapp } = await request.json();
    const telegramId = Number(params.telegramId);
    console.log("startapp", startapp);
    const { db } = await connectToDatabase();

    // Check if the user already exists
    const existingUser = await db
      .collection("telegramUsers")
      .findOne({ telegramId });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Define default values for the new user
    const newUser: User = {
      _id: new ObjectId(),
      name,
      username,
      telegramId,
      referredBy: Number(startapp),
      referrals: [],
      score: 0,
      level: 1,
      isMining: false,
      miningSpeed: 1,
      lastMiningStart: 0,
      boosters: {
        power: {
          level: 1,
          multiplier: 0,
          lastUsed: new Date(),
        },
        activeBoosters: [],
        cooldowns: {},
      },
      weeklyStreak: 0,
      lastStreakUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the new user into the database
    const result = await db.collection("telegramUsers").insertOne(newUser);

    if (result.insertedId) {
      // If a valid referral code was used, update the referrer's score

      if (startapp) {
        const referrerTelegramId = Number(startapp);
        const referrer = await db
          .collection("telegramUsers")
          .findOne({ telegramId: referrerTelegramId });

        if (referrer) {
          const isReferralAlreadyAdded = referrer.referrals.includes(
            Number(telegramId)
          );
          if (!isReferralAlreadyAdded) {
            await db.collection("telegramUsers").updateOne(
              { telegramId: referrerTelegramId },
              {
                $inc: { score: 100 },
                $addToSet: { referrals: Number(telegramId) },
              }
            );
          }
        }
      }

      return NextResponse.json(
        { success: true, data: newUser },
        { status: 201 }
      );
    } else {
      throw new Error("Failed to create user");
    }
  } catch (error) {
    console.error("Error handling user data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// start mining api
export async function PATCH(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    const telegramId = Number(params.telegramId);
    const { db } = await connectToDatabase();

    // Fetch user
    const user = (await db
      .collection("telegramUsers")
      .findOne({ telegramId })) as User;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    // Check if the user is already mining
    if (user.isMining && user.lastMiningStart) {
      const timeElapsed = now - user.lastMiningStart;
      if (timeElapsed < FOUR_HOURS) {
        return NextResponse.json(
          { success: false, error: "User is already mining" },
          { status: 400 }
        );
      }
    }

    // If the user wasn't mining or the previous session is complete, start a new mining session
    const updatedUser = {
      ...user,
      isMining: true,
      lastMiningStart: now,
      lastSessionCompleted: false,
    };

    // Update user data in the database
    await db
      .collection("telegramUsers")
      .updateOne({ telegramId }, { $set: updatedUser });

    // Return updated user data
    return NextResponse.json(
      {
        success: true,
        message: "Mining started successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting mining:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
