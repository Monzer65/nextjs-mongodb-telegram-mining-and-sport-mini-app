// // app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = Number(searchParams.get("telegramId"));
    const limit = Number(searchParams.get("limit")) || 10; // Default to 10 if not provided

    if (isNaN(telegramId)) {
      return NextResponse.json(
        { success: false, error: "Invalid telegramId" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Aggregating to get leaderboard and rank
    const usersCollection = db.collection("telegramUsers");

    // Get the leaderboard and user's rank in one go
    const leaderboardAndRank = await usersCollection
      .aggregate([
        {
          // Sorting users by score
          $sort: { score: -1 },
        },
        {
          // Adding a rank field
          $setWindowFields: {
            sortBy: { score: -1 },
            output: {
              rank: { $rank: {} },
            },
          },
        },
        {
          // Project only required fields
          $project: {
            _id: 0,
            name: 1,
            username: 1,
            telegramId: 1,
            score: 1,
            rank: 1,
          },
        },
      ])
      .toArray();

    // Get leaderboard limited to `limit` entries
    const leaderboard = leaderboardAndRank.slice(0, limit);

    // Find the user's rank and score from the aggregated data
    const user = leaderboardAndRank.find(
      (entry) => entry.telegramId === telegramId
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      userRank: user.rank,
      userScore: user.score,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const telegramId = Number(searchParams.get("telegramId"));
//     const limit = Number(searchParams.get("limit")) || 10; // Default to 10 if not provided

//     if (isNaN(telegramId)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid telegramId" },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();

//     // Get the user's score
//     const user = await db.collection("telegramUsers").findOne({ telegramId });
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Get the leaderboard
//     const leaderboard = await db
//       .collection("telegramUsers")
//       .find(
//         {},
//         {
//           projection: { _id: 0, name: 1, username: 1, telegramId: 1, score: 1 },
//         }
//       )
//       .sort({ score: -1 })
//       .limit(limit)
//       .toArray();

//     // Get the user's rank
//     const userRank =
//       (await db
//         .collection("telegramUsers")
//         .countDocuments({ score: { $gt: user.score } })) + 1;

//     return NextResponse.json({
//       success: true,
//       leaderboard,
//       userRank,
//       userScore: user.score,
//     });
//   } catch (error) {
//     console.error("Error fetching leaderboard:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
