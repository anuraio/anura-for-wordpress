import { ExclusionAudience } from "~/schemas/settings.schema";
import {
  getPlatformStatus,
  getPlatformOptions,
  PLATFORM_LIMITS
} from "../platform";
import { describe, test, expect } from "vitest";

// Helper to create test audiences
const createTestAudience = (overrides: Partial<ExclusionAudience> = {}): ExclusionAudience => ({
  id: Date.now().toString() + Math.random(),
  platform: "linkedin",
  fields: { partnerId: "123" },
  enabled: true,
  ...overrides
});

describe("getPlatformStatus", () => {
  test("returns not restricted when no limit defined", () => {
    const audiences: ExclusionAudience[] = [];
    const result = getPlatformStatus("google", audiences);

    expect(result.isRestricted).toBe(false);
    expect(result.activeCount).toBe(0);
  });

  test("returns not restricted when under limit", () => {
    const audiences = [
      createTestAudience({ platform: "linkedin", enabled: false })
    ];
    const result = getPlatformStatus("linkedin", audiences);

    expect(result.isRestricted).toBe(false);
    expect(result.activeCount).toBe(0);
  });

  test("returns restricted when at limit", () => {
    const audiences = [
      createTestAudience({ platform: "linkedin", enabled: true })
    ];
    const result = getPlatformStatus("linkedin", audiences);

    expect(result.isRestricted).toBe(true);
    expect(result.activeCount).toBe(1);
    expect(result.maxActive).toBe(1);
    expect(result.tooltipMessage).toContain("LinkedIn Business only supports 1 active");
  });

  test("excludes editing audience from count", () => {
    const editingAudience = createTestAudience({ 
      id: "editing-123",
      platform: "linkedin", 
      enabled: true 
    });
    const audiences = [editingAudience];
    
    const result = getPlatformStatus("linkedin", audiences, "editing-123");

    expect(result.isRestricted).toBe(false);
    expect(result.activeCount).toBe(0);
  });

  test("handles multiple active audiences correctly", () => {
    const audiences = [
      createTestAudience({ platform: "linkedin", enabled: true }),
      createTestAudience({ platform: "linkedin", enabled: false }),
      createTestAudience({ platform: "google", enabled: true })
    ];
    
    const result = getPlatformStatus("linkedin", audiences);

    expect(result.isRestricted).toBe(true);
    expect(result.activeCount).toBe(1);
  });
});

describe("getEnhancedPlatformOptions", () => {
  test("returns all platform options when no restrictions", () => {
    const audiences: ExclusionAudience[] = [];
    const options = getPlatformOptions(audiences);

    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toHaveProperty("value");
    expect(options[0]).toHaveProperty("label");
    expect(options[0]).toHaveProperty("isRestricted");
  });

  test("marks restricted platforms correctly", () => {
    const audiences = [
      createTestAudience({ platform: "linkedin", enabled: true })
    ];
    const options = getPlatformOptions(audiences);

    const linkedinOption = options.find(opt => opt.value === "linkedin");
    expect(linkedinOption?.isRestricted).toBe(true);
    
    if (linkedinOption?.isRestricted) {
      expect(linkedinOption.tooltipMessage).toContain("LinkedIn");
      expect(linkedinOption.activeCount).toBe(1);
      expect(linkedinOption.maxActive).toBe(1);
    }
  });

  test("allows unrestricted platforms", () => {
    const audiences = [
      createTestAudience({ platform: "google", enabled: true })
    ];
    const options = getPlatformOptions(audiences);

    const googleOption = options.find(opt => opt.value === "google");
    expect(googleOption?.isRestricted).toBe(false);
  });

  test("excludes editing audience from restrictions", () => {
    const editingId = "editing-123";
    const audiences = [
      createTestAudience({ 
        id: editingId,
        platform: "taboola", 
        enabled: true 
      })
    ];
    
    const options = getPlatformOptions(audiences, editingId);
    const taboolaOption = options.find(opt => opt.value === "taboola");
    
    expect(taboolaOption?.isRestricted).toBe(false);
  });

  test("handles empty select option correctly", () => {
    const audiences: ExclusionAudience[] = [];
    const options = getPlatformOptions(audiences);

    const emptyOption = options.find(opt => opt.value === "");
    expect(emptyOption?.isRestricted).toBe(false);
  });
});

describe("PLATFORM_LIMITS", () => {
  test("contains expected limited platforms", () => {
    expect(PLATFORM_LIMITS.linkedin).toBe(1);
    expect(PLATFORM_LIMITS.taboola).toBe(1);
    expect(PLATFORM_LIMITS.outbrain).toBe(1);
    expect(PLATFORM_LIMITS.twitter).toBe(1);
  });

  test("unlimited platforms are not in limits", () => {
    expect((PLATFORM_LIMITS as any).google).toBeUndefined();
    expect((PLATFORM_LIMITS as any).meta).toBeUndefined();
  });
});