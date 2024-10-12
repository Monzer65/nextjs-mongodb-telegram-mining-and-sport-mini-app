// app/api/users/[telegramId]/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { ActiveBoosts, BoosterCooldowns, User } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

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
    const now = Date.now(); // Current timestamp in milliseconds
    const lastMiningStart = user.lastMiningStart ?? 0; // Fallback to 0 if null
    const lastScoreUpdate = user.lastScoreUpdate ?? now; // Fallback to current time if null

    // Calculate the time elapsed since mining started (if mining started)
    const timeElapsed = lastMiningStart ? now - lastMiningStart : 0;

    // Determine if the user is still mining (mining session hasn't exceeded 4 hours)
    const isMining = timeElapsed < FOUR_HOURS && user.isMining;

    // Calculate the remaining time in the current mining session
    const timeRemaining = isMining ? FOUR_HOURS - timeElapsed : 0;

    // Initialize newScore with the user's current score
    let newScore = user.score;

    // Process all active boosts (speed, power, luck, etc.)
    const activeBoosts = user.activeBoosts || {};

    // Base effective mining speed (without boosts)
    let effectiveSpeed = user.miningSpeed;

    Object.entries(activeBoosts).forEach(([boostType, boost]) => {
      if (boost.expiresAt && now < boost.expiresAt) {
        if (boostType === "speed") {
          effectiveSpeed *= boost.multiplier;
        }
        if (boostType === "fortune") {
          effectiveSpeed *= boost.multiplier;
        }
      }
      if (boostType === "power") {
        effectiveSpeed *= boost.multiplier;
      }
    });

    // Calculate accumulated score for completed 4-hour sessions
    const completedSessions = Math.floor((now - lastScoreUpdate) / FOUR_HOURS);
    if (completedSessions > 0) {
      const accumulatedScore =
        completedSessions * FOUR_HOURS * effectiveSpeed * 0.001;
      newScore += accumulatedScore;
    }

    // Update newScore if the user is still mining in the current session
    if (isMining) {
      const currentSessionTime = (now - lastScoreUpdate) % FOUR_HOURS;
      newScore += (currentSessionTime * effectiveSpeed * 0.001) / 1000; // Convert to seconds
    }

    // Prepare updated user data
    const updatedUser = {
      ...user,
      score: parseFloat(newScore.toFixed(3)),
      isMining,
      effectiveSpeed,
      timeRemaining,
      lastScoreUpdate: now,
    };

    // Remove expired boosts
    const updatedActiveBoosts: ActiveBoosts = {};
    Object.entries(activeBoosts).forEach(([boostType, boost]) => {
      if (
        boostType === "power" ||
        (boost && boost.expiresAt && boost.expiresAt > now)
      ) {
        updatedActiveBoosts[boostType] = boost;
      }
    });
    updatedUser.activeBoosts = updatedActiveBoosts;

    // Update booster cooldowns
    const boosterCooldowns = user.boosterCooldowns || {};
    const updatedBoosterCooldowns: BoosterCooldowns = {};
    Object.entries(boosterCooldowns).forEach(([boosterId, cooldown]) => {
      if (cooldown && cooldown.expiresAt > now) {
        updatedBoosterCooldowns[boosterId] = cooldown;
      }
    });
    updatedUser.boosterCooldowns = updatedBoosterCooldowns;

    // Update user data in the database
    await db
      .collection("telegramUsers")
      .updateOne({ telegramId }, { $set: updatedUser });

    // Return updated user data
    return NextResponse.json(
      { success: true, user: updatedUser },
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
    const { name, username, referralCode } = await request.json();
    const telegramId = Number(params.telegramId);

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
      referredBy: Number(referralCode) || null, // Default to null if no referral code
      referrals: [], // New users haven't referred anyone yet
      score: 0, // Default score is 0
      lastScoreUpdate: Date.now(), // Default to current date
      level: "1", // Starting at level 1 as a string (match type)
      isMining: false, // Not mining initially
      miningSpeed: 1, // Default mining speed is 1
      effectiveSpeed: 1,
      lastMiningStart: null, // No mining started yet, could also be Date or number if needed
      timeRemaining: 0, // No time remaining initially (in milliseconds)
      activeBoosts: {}, // No active boosts initially (optional field, so can be left empty)
      boosterCooldowns: {}, // No booster cooldowns initially (optional field)
      createdAt: new Date(), // Default to current date
      updatedAt: new Date(), // Default to current date
    };

    // Insert the new user into the database
    const result = await db.collection("telegramUsers").insertOne(newUser);

    if (result.insertedId) {
      // If a valid referral code was used, update the referrer's score
      if (referralCode) {
        const referrer = await db
          .collection("telegramUsers")
          .findOne({ telegramId: Number(referralCode) });

        if (referrer) {
          const isReferralAlreadyAdded =
            referrer.referrals.includes(telegramId);

          if (!isReferralAlreadyAdded) {
            await db.collection("telegramUsers").updateOne(
              { telegramId: Number(referralCode) },
              {
                $inc: { score: 100 },
                $addToSet: { referrals: telegramId },
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
    const user = await db.collection("telegramUsers").findOne({ telegramId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isMining == true) {
      return NextResponse.json(
        { success: false, error: "User is already mining" },
        { status: 404 }
      );
    }

    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    const isMining = true;
    const lastMiningStart = now;
    const lastScoreUpdate = now;
    const timeRemaining = FOUR_HOURS - lastMiningStart;

    const updatedUser = {
      ...user,
      lastMiningStart,
      lastScoreUpdate,
      isMining,
      timeRemaining,
    };

    await db
      .collection("telegramUsers")
      .updateOne({ telegramId }, { $set: updatedUser });

    return NextResponse.json(
      { success: true, user: updatedUser },
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
