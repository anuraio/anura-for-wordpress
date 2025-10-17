import { BotPattern } from "~/schemas/settings.schema";
import { groupBotsByPlatform, areAllBotsEnabled, DEFAULT_PLATFORM } from "../bots";
import { describe, test, expect } from "vitest";

// Helper to create test bots
const createTestBot = (overrides: Partial<BotPattern> = {}): BotPattern => ({
  id: Date.now().toString() + Math.random(),
  name: "Test Bot",
  type: "userAgent",
  pattern: "bot",
  enabled: true,
  isCustom: false,
  ...overrides,
});

describe("groupBotsByPlatform", () => {
  test("groups bots by platform correctly", () => {
    const bots = [
      createTestBot({ platform: "google", name: "Google Bot 1" }),
      createTestBot({ platform: "google", name: "Google Bot 2" }),
      createTestBot({ platform: "meta", name: "Meta Bot" }),
    ];

    const result = groupBotsByPlatform(bots);

    expect(result.google).toHaveLength(2);
    expect(result.meta).toHaveLength(1);
    expect(result.google[0].name).toBe("Google Bot 1");
    expect(result.google[1].name).toBe("Google Bot 2");
    expect(result.meta[0].name).toBe("Meta Bot");
  });

  test("assigns bots without platform to 'other'", () => {
    const bots = [
      createTestBot({ name: "No Platform Bot 1" }),
      createTestBot({ platform: undefined, name: "No Platform Bot 2" }),
    ];

    const result = groupBotsByPlatform(bots);

    expect(result[DEFAULT_PLATFORM]).toHaveLength(2);
    expect(result[DEFAULT_PLATFORM][0].name).toBe("No Platform Bot 1");
    expect(result[DEFAULT_PLATFORM][1].name).toBe("No Platform Bot 2");
  });

  test("handles empty array", () => {
    const result = groupBotsByPlatform([]);

    expect(result).toEqual({});
  });

  test("handles single bot", () => {
    const bots = [createTestBot({ platform: "linkedin", name: "Solo Bot" })];

    const result = groupBotsByPlatform(bots);

    expect(result.linkedin).toHaveLength(1);
    expect(result.linkedin[0].name).toBe("Solo Bot");
  });

  test("handles mixed platforms and undefined", () => {
    const bots = [
      createTestBot({ platform: "google", name: "Google Bot" }),
      createTestBot({ platform: undefined, name: "Other Bot 1" }),
      createTestBot({ platform: "meta", name: "Meta Bot" }),
      createTestBot({ name: "Other Bot 2" }),
    ];

    const result = groupBotsByPlatform(bots);

    expect(result.google).toHaveLength(1);
    expect(result.meta).toHaveLength(1);
    expect(result[DEFAULT_PLATFORM]).toHaveLength(2);
  });

  test("preserves bot properties", () => {
    const bots = [
      createTestBot({
        id: "bot-123",
        platform: "snapchat",
        name: "Snapchat Bot",
        type: "location",
        pattern: "snap",
        enabled: false,
      }),
    ];

    const result = groupBotsByPlatform(bots);

    expect(result.snapchat[0]).toEqual({
      id: "bot-123",
      platform: "snapchat",
      name: "Snapchat Bot",
      type: "location",
      pattern: "snap",
      enabled: false,
      isCustom: false,
    });
  });
});

describe("areAllBotsEnabled", () => {
  test("returns true when all bots are enabled", () => {
    const bots = [
      createTestBot({ enabled: true }),
      createTestBot({ enabled: true }),
      createTestBot({ enabled: true }),
    ];

    expect(areAllBotsEnabled(bots)).toBe(true);
  });

  test("returns false when some bots are disabled", () => {
    const bots = [
      createTestBot({ enabled: true }),
      createTestBot({ enabled: false }),
      createTestBot({ enabled: true }),
    ];

    expect(areAllBotsEnabled(bots)).toBe(false);
  });

  test("returns false when all bots are disabled", () => {
    const bots = [
      createTestBot({ enabled: false }),
      createTestBot({ enabled: false }),
    ];

    expect(areAllBotsEnabled(bots)).toBe(false);
  });

  test("returns false for empty array", () => {
    expect(areAllBotsEnabled([])).toBe(false);
  });

  test("returns true for single enabled bot", () => {
    const bots = [createTestBot({ enabled: true })];

    expect(areAllBotsEnabled(bots)).toBe(true);
  });

  test("returns false for single disabled bot", () => {
    const bots = [createTestBot({ enabled: false })];

    expect(areAllBotsEnabled(bots)).toBe(false);
  });
});

describe("DEFAULT_PLATFORM", () => {
  test("has expected value", () => {
    expect(DEFAULT_PLATFORM).toBe("other");
  });
});
