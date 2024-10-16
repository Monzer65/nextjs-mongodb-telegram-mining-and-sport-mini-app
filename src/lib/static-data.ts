import { Booster } from "./types";
export const boosters: Booster[] = [
  {
    id: "speed",
    name: "Daily Super Mining",
    cost: 0,
    multiplier: 8, // Strong boost
    activeDuration: 60000, // 1 minute (in milliseconds)
    cooldownDuration: 86400000, // 24 hours (in milliseconds)
  },
  {
    id: "power",
    name: "Upgrade Mining Speed",
    cost: 5, // Initial cost for level 1
    multiplier: 1.05, // Initial multiplier
    level: 1, // Start at level 1
    maxLevel: 20, // Total of 20 levels
    upgradeCostFactor: 1.5, // Exponential increase in cost
    speedIncrement: 0.05, // 5% increase per level
    cooldownDuration: 14400000,
  },
  {
    id: "fortune",
    name: "Wheel of Fortune",
    cost: 0, // Free to spin
    multiplier: () => Math.random() * (10 - 1) + 1, // Random multiplier between 1x and 3x
    activeDuration: 600000, // Lasts for 10 minutes (in milliseconds)
    cooldownDuration: 14400000, // 4 hours
  },
];
