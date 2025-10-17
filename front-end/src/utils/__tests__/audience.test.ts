import {
  getDisplayName,
  getPrimaryId,
  validateAudienceForm,
  isAudienceFormValid,
  createAudience,
  getStatusText,
  getToggleActionText,
} from "../audience";
import { describe, test, expect } from "vitest";

describe("getDisplayName", () => {
  test("returns platform name only when no label", () => {
    const audience = {
      id: "1",
      platform: "meta",
      fields: { pixelId: "123" },
      enabled: true,
    };

    expect(getDisplayName(audience)).toBe("Meta Business");
  });

  test("returns platform name with label when provided", () => {
    const audience = {
      id: "1",
      platform: "google",
      label: "Campaign A",
      fields: { adTagId: "456" },
      enabled: true,
    };

    expect(getDisplayName(audience)).toBe("Google Ads - Campaign A");
  });

  test("handles unknown platform", () => {
    const audience = {
      id: "1",
      platform: "unknown",
      fields: {},
      enabled: true,
    };

    expect(getDisplayName(audience)).toBe("unknown");
  });
});

describe("getPrimaryId", () => {
  test("returns first field value for known platform", () => {
    const audience = {
      id: "1",
      platform: "meta",
      fields: { pixelId: "123456" },
      enabled: true,
    };

    expect(getPrimaryId(audience)).toBe("123456");
  });

  test('returns "Not set" when field is empty', () => {
    const audience = {
      id: "1",
      platform: "google",
      fields: { adTagId: "" },
      enabled: true,
    };

    expect(getPrimaryId(audience)).toBe("Not set");
  });

  test("returns null for unknown platform", () => {
    const audience = {
      id: "1",
      platform: "unknown",
      fields: { someField: "value" },
      enabled: true,
    };

    expect(getPrimaryId(audience)).toBe(null);
  });
});

describe("validateAudienceForm", () => {
  test("returns success for valid form", () => {
    const result = validateAudienceForm("meta", { pixelId: "123456" });

    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  test("returns error for empty platform", () => {
    const result = validateAudienceForm("", { pixelId: "123" });

    expect(result.success).toBe(false);
    expect(result.errors?.platform).toBe("Platform is required");
  });

  test("returns error for invalid platform", () => {
    const result = validateAudienceForm("invalid", { someId: "123" });

    expect(result.success).toBe(false);
    expect(result.errors?.platform).toBe("Invalid platform selected");
  });

  test("returns error for missing required fields", () => {
    const result = validateAudienceForm("linkedin", { partnerId: "" });

    expect(result.success).toBe(false);
    expect(result.errors?.partnerId).toContain("required");
  });

  test("returns multiple field errors", () => {
    const result = validateAudienceForm("linkedin", {
      partnerId: "",
      event: "",
    });

    expect(result.success).toBe(false);
    expect(result.errors?.partnerId).toContain("required");
    expect(result.errors?.event).toContain("required");
  });
});

describe("isAudienceFormValid", () => {
  test("returns true for valid form", () => {
    expect(isAudienceFormValid("meta", { pixelId: "123456" })).toBe(true);
  });

  test("returns false for invalid form", () => {
    expect(isAudienceFormValid("", { pixelId: "123" })).toBe(false);
    expect(isAudienceFormValid("meta", { pixelId: "" })).toBe(false);
  });
});

describe("createAudience", () => {
  test("creates audience with required fields", () => {
    const audience = createAudience("meta", "Test Campaign", {
      pixelId: "123456",
    });

    expect(audience.platform).toBe("meta");
    expect(audience.label).toBe("Test Campaign");
    expect(audience.fields.pixelId).toBe("123456");
    expect(audience.enabled).toBe(true);
    expect(audience.id).toBeDefined();
  });

  test("creates audience without label", () => {
    const audience = createAudience("google", "", { adTagId: "789" });

    expect(audience.platform).toBe("google");
    expect(audience.label).toBeUndefined();
    expect(audience.enabled).toBe(true);
  });

  test("creates inactive audience when specified", () => {
    const audience = createAudience("meta", "", { pixelId: "123" }, false);

    expect(audience.enabled).toBe(false);
  });

  test("trims whitespace from label", () => {
    const audience = createAudience("meta", "  Test  ", { pixelId: "123" });

    expect(audience.label).toBe("Test");
  });

  test("throws error for invalid audience data", () => {
    expect(() => {
      createAudience("", "", {});
    }).toThrow();
  });
});

describe("getStatusText", () => {
  test("returns Active for active audience", () => {
    const audience = { id: "1", platform: "meta", fields: {}, enabled: true };
    expect(getStatusText(audience)).toBe("Active");
  });

  test("returns Inactive for inactive audience", () => {
    const audience = { id: "1", platform: "meta", fields: {}, enabled: false };
    expect(getStatusText(audience)).toBe("Inactive");
  });
});

describe("getToggleActionText", () => {
  test("returns deactivated for active audience", () => {
    const audience = { id: "1", platform: "meta", fields: {}, enabled: true };
    expect(getToggleActionText(audience)).toBe("deactivated");
  });

  test("returns activated for inactive audience", () => {
    const audience = { id: "1", platform: "meta", fields: {}, enabled: false };
    expect(getToggleActionText(audience)).toBe("activated");
  });
});