// app/api/users/[telegramId]/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/types";
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
    const now = Date.now();
    const lastMiningStart = user.lastMiningStart ?? 0;
    const timeElapsed = lastMiningStart ? now - lastMiningStart : 0;

    // If more than 4 hours have elapsed since the last mining start, finalize the score update
    if (timeElapsed >= FOUR_HOURS && user.isMining) {
      const fullSessionScore = (FOUR_HOURS * 0.001 * user.miningSpeed) / 1000;
      const newScore = user.score + fullSessionScore;

      const updatedUser = {
        ...user,
        score: newScore,
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
      level: "1", // Starting at level 1 as a string (match type)
      isMining: false, // Not mining initially
      miningSpeed: 1, // Default mining speed is 1
      lastMiningStart: 0, // No mining started yet, could also be Date or number if needed
      boosters: {
        power: {
          level: 0,
          multiplier: 1,
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
