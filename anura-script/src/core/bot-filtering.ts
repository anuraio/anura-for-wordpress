import { BotPattern, BotSettings } from "../types";

export function shouldIgnoreVisitor(botSettings: BotSettings): boolean {
  if (!botSettings?.enabled || !botSettings?.whitelist) {
    return false;
  }

  const enabledBots = botSettings.whitelist.filter((bot) => bot.enabled);
  if (enabledBots.length === 0) return false;

  const combinedPatterns = buildCombinedRegex(enabledBots);
  const userAgent = navigator.userAgent || "";
  const location = window.location.href || "";
  const referrer = document.referrer || "";

  const hasUserAgentMatch = combinedPatterns.userAgent?.test(userAgent);
  const hasLocationMatch = combinedPatterns.location?.test(location);
  const hasReferrerMatch = combinedPatterns.referrer?.test(referrer);

  const noMatchFound =
    !hasUserAgentMatch && !hasLocationMatch && !hasReferrerMatch;
  if (noMatchFound) {
    return false;
  }

  return true;
}

interface CombinedPatterns {
  userAgent: RegExp | null;
  location: RegExp | null;
  referrer: RegExp | null;
}

function buildCombinedRegex(enabledBots: BotPattern[]): CombinedPatterns {
  const patterns = {
    userAgent: [] as string[],
    location: [] as string[],
    referrer: [] as string[],
  };

  for (const bot of enabledBots) {
    try {
      new RegExp(bot.pattern, "i");

      const needsGrouping =
        bot.pattern.includes("|") && !bot.pattern.includes("\\|");

      const wrappedPattern = needsGrouping ? `(${bot.pattern})` : bot.pattern;

      patterns[bot.type].push(wrappedPattern);
    } catch (e) {}
  }

  return {
    userAgent: patterns.userAgent.length
      ? new RegExp(patterns.userAgent.join("|"), "i")
      : null,
    location: patterns.location.length
      ? new RegExp(patterns.location.join("|"), "i")
      : null,
    referrer: patterns.referrer.length
      ? new RegExp(patterns.referrer.join("|"), "i")
      : null,
  };
}
