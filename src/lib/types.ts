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

export interface ActiveBoosts {
  [key: string]: { multiplier: number; expiresAt: Timestamp } | undefined;
}

export interface BoosterCooldowns {
  [key: string]: { expiresAt: Timestamp } | undefined;
}

export type BoosterId = "speed" | "power" | "luck";

export interface Booster {
  name: string;
  multiplier: number;
  duration: number;
  cost: number;
  cooldown: number;
}

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
