import { ObjectId } from "mongodb";

export type User = {
  _id: ObjectId;
  name: string;
  username: string;
  telegramId: number;
  score: number;
  lastScoreUpdate?: Timestamp;
  referredBy: number | null;
  referrals: string[];
  level: string;
  isMining: boolean;
  miningSpeed: number;
  effectiveSpeed: number;
  lastMiningStart: Timestamp | null;
  timeRemaining: Timestamp;
  activeBoosts?: ActiveBoosts;
  boosterCooldowns?: BoosterCooldowns;
  createdAt: Date;
  updatedAt: Date;
};

type Timestamp = number;

export type BoostActivationResponse = {
  success: boolean; // Whether the boost activation was successful
  boosterId: string; // ID of the activated booster
  boosterName: string; // Name of the activated booster
  multiplier: number; // The multiplier applied by the boost
  expiresAt: number; // When the boost will expire (timestamp)
  cooldownExpiresAt: number; // When the cooldown will expire (timestamp)
  error?: string; // Error message in case of failure
};

export type ActiveBoost = {
  multiplier: number; // Current multiplier from this boost
  expiresAt?: number; // Timestamp for when the boost expires
  level?: number; // Current level for progressive boosters (optional)
};

export type ActiveBoosts = {
  [boosterId: string]: ActiveBoost; // Mapping of booster IDs to active boosts
};

export type BoosterCooldown = {
  multiplier: number;
  expiresAt: number;
  level?: number;
};

export type BoosterCooldowns = {
  [boosterId: string]: BoosterCooldown; // Mapping of booster IDs to cooldowns
};

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
