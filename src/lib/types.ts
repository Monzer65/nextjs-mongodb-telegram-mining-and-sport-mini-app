import { ObjectId } from "mongodb";

export type User = {
  _id: ObjectId;
  name: string;
  username: string;
  telegramId: number;
  score: number;
  lastMiningStart: Timestamp;
  referredBy: number | null;
  referrals: string[];
  level: string;
  isMining: boolean;
  miningSpeed: number;
  boosters: {
    power: {
      level: number;
      multiplier: number;
    };
    activeBoosters: UserBooster[];
    cooldowns: Record<string, Date>;
  };
  weeklyStreak: number;
  lastStreakUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
};

type Timestamp = number;
export type UserBooster = {
  id: string;
  level?: number;
  multiplier: number;
  expiresAt?: Date;
  lastUsed: Date;
};

// Define the main Booster type
export type Booster = {
  id: string; // Unique identifier for the booster
  name: string; // Name of the booster
  cost: number; // Cost to activate or upgrade the booster
  multiplier: number | (() => number); // Boost multiplier or a function to generate a multiplier (for random multipliers)
  activeDuration?: number; // How long the boost lasts (in milliseconds)
  cooldownDuration?: number; // How long the cooldown lasts (in milliseconds)
  level?: number; // Current level of the booster (optional, for progressive boosters)
  maxLevel?: number; // Maximum level the booster can reach (optional)
  upgradeCostFactor?: number; // Factor to increase the cost by per level (optional)
  speedIncrement?: number; // Speed increment per level (optional, for progressive boosters)
};

export interface Task {
  id: string;
  description: string;
  chatId: string;
  points: number;
  completed: boolean;
  channelId: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  language_code?: string;
}

export interface TelegramResponse {
  ok: boolean;
  result?: {
    status: string;
    user: TelegramUser;
    is_anonymous?: boolean;
  };
  error_code?: number;
  description?: string;
}
