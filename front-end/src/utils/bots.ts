import { BotPattern } from "~/schemas/settings.schema";

export const DEFAULT_PLATFORM = "other" as const;

/**
 * Groups bot patterns by their platform field.
 * Bots without a platform are grouped under 'other'.
 */
export function groupBotsByPlatform(
  bots: BotPattern[]
): Record<string, BotPattern[]> {
  return bots.reduce((groups, bot) => {
    const platform = bot.platform || DEFAULT_PLATFORM;

    if (!groups[platform]) {
      groups[platform] = [];
    }

    groups[platform].push(bot);
    
    return groups;
  }, {} as Record<string, BotPattern[]>);
}

/**
 * Checks if all bots in the provided array are enabled.
 * Returns false for an empty array.
 */
export function areAllBotsEnabled(bots: BotPattern[]): boolean {
  if (bots.length === 0) {
    return false;
  }
  return bots.every((bot) => bot.enabled);
}
