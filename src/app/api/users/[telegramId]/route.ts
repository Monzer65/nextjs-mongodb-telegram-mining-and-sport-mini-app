// app/api/users/[telegramId]/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// export async function GET(
//   request: Request,
//   { params }: { params: { telegramId: string } }
// ) {
//   try {
//     const telegramId = Number(params.telegramId);
//     const { db } = await connectToDatabase();

//     const user = (await db
//       .collection("telegramUsers")
//       .findOne({ telegramId })) as User;

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "User not found" },
//         { status: 404 }
//       );
//     }

//     const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
//     const now = Date.now();
//     const lastMiningStart = user.lastMiningStart ?? 0;
//     const timeElapsed = lastMiningStart ? now - lastMiningStart : 0;

//     // If more than 4 hours have elapsed since the last mining start, finalize the score update
//     if (timeElapsed >= FOUR_HOURS && user.isMining) {
//       const fullSessionScore = (FOUR_HOURS * 0.001 * user.miningSpeed) / 1000;
//       const newScore = user.score + fullSessionScore;

//       const updatedUser = {
//         ...user,
//         score: newScore,
//         isMining: false,
//         lastMiningStart: 0,
//       };

//       // Update user data in the database
//       await db
//         .collection("telegramUsers")
//         .updateOne({ telegramId }, { $set: updatedUser });

//       return NextResponse.json(
//         { success: true, user: updatedUser },
//         { status: 200 }
//       );
//     }

//     // If the mining session is still within 4 hours, or no updates are needed:
//     return NextResponse.json({ success: true, user }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// Define level thresholds based on your previous suggestions
const levelThresholds = [
  0, // Level 1: 0 points
  10000, // Level 2: 10,000 points
  50000, // Level 3: 50,000 points
  200000, // Level 4: 200,000 points
  500000, // Level 5: 500,000 points
  1000000, // Level 6: 1,000,000 points
  5000000, // Level 7: 5,000,000 points
  10000000, // Level 8: 10,000,000 points
  20000000, // Level 9: 20,000,000 points
  50000000, // Level 10: 50,000,000 points
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

    // Calculate the effective mining speed with boosters
    let effectiveMiningSpeed = user.miningSpeed;

    // Add the permanent power booster's multiplier
    const powerMultiplier = user.boosters.power.multiplier;
    effectiveMiningSpeed += powerMultiplier;

    // Calculate the multiplier effect of each active booster that has not expired
    user.boosters.activeBoosters.forEach((booster) => {
      if (booster.expiresAt && booster.expiresAt.getTime() > now) {
        effectiveMiningSpeed *= booster.multiplier;
      }
    });

    // Cap timeElapsed to a maximum of 4 hours if the user is still mining
    const cappedTimeElapsed = Math.min(timeElapsed, FOUR_HOURS);

    // Calculate the score gain based on the time elapsed and the effective mining speed
    const sessionScore =
      (cappedTimeElapsed * 0.001 * effectiveMiningSpeed) / 1000;

    // Update the user's score if the mining session time is complete
    if (cappedTimeElapsed >= FOUR_HOURS && user.isMining) {
      const newScore = user.score + sessionScore;

      // Calculate the user's level based on the new score
      let level = 1; // Default to level 1
      for (let i = 0; i < levelThresholds.length; i++) {
        if (newScore >= levelThresholds[i]) {
          level = i + 1; // Levels are 1-indexed
        } else {
          break; // Stop when the next threshold is not met
        }
      }

      const updatedUser = {
        ...user,
        score: newScore,
        level: level, // Update the user's level
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

    // If the mining session is still within 4 hours, or no updates are needed:
    return NextResponse.json({ success: true, user }, { status: 200 });
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
      level: 1, // Starting at level 1 as a string (match type)
      isMining: false, // Not mining initially
      miningSpeed: 1, // Default mining speed is 1
      lastMiningStart: 0, // No mining started yet, could also be Date or number if needed
      boosters: {
        power: {
          level: 0,
          multiplier: 1,
          lastUsed: new Date(),
        },
        activeBoosters: [],
        cooldowns: {},
      },
      weeklyStreak: 0,
      lastStreakUpdate: new Date(),
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
