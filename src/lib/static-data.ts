import { Booster, BoosterId } from "./types";

export const boosters: Record<BoosterId, Booster> = {
  speed: {
    name: "Speed Demon",
    multiplier: 3,
    duration: 30 * 60,
    cost: 150,
    cooldown: 60 * 60,
  },
  power: {
    name: "Power Surge",
    multiplier: 5,
    duration: 15 * 60,
    cost: 250,
    cooldown: 90 * 60,
  },
  luck: {
    name: "Lucky Strike",
    multiplier: 2,
    duration: 45 * 60,
    cost: 200,
    cooldown: 120 * 60,
  },
};
