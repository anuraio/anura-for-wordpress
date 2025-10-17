import { describe, test, expect } from "vitest";
import { isTagFormValid } from "../tagModal.utils";

describe("isTagFormValid", () => {
  describe("Platform validation", () => {
    test("returns false with empty platform", () => {
      const result = isTagFormValid("", { tagId: "123" });
      expect(result).toBe(false);
    });

    test("returns false with invalid platform", () => {
      // @ts-expect-error - Testing invalid platform value
      const result = isTagFormValid("invalid-platform", { tagId: "123" });
      expect(result).toBe(false);
    });

    test("returns true with valid platform and fields", () => {
      const result = isTagFormValid("google", { tagId: "G-123456789" });
      expect(result).toBe(true);
    });
  });

  describe("Field validation", () => {
    test("returns false with empty fields", () => {
      const result = isTagFormValid("google", {});
      expect(result).toBe(false);
    });

    test("returns false with empty field value", () => {
      const result = isTagFormValid("google", { tagId: "" });
      expect(result).toBe(false);
    });

    test("returns false with whitespace-only field value", () => {
      const result = isTagFormValid("google", { tagId: "   " });
      expect(result).toBe(false);
    });

    test("returns true with field containing whitespace around valid value", () => {
      const result = isTagFormValid("google", { tagId: "  G-123456789  " });
      expect(result).toBe(true);
    });

    test("returns false when required field is missing", () => {
      const result = isTagFormValid("google", { wrongField: "123" });
      expect(result).toBe(false);
    });
  });

  describe("Platform-specific validations", () => {
    test("validates Google Ads tag", () => {
      expect(isTagFormValid("google", { tagId: "G-XXXXXXXXXX" })).toBe(true);
      expect(isTagFormValid("google", { tagId: "AW-XXXXXXXXXX" })).toBe(true);
      expect(isTagFormValid("google", { tagId: "" })).toBe(false);
    });

    test("validates Meta Business tag", () => {
      expect(isTagFormValid("meta", { tagId: "123456789012345" })).toBe(true);
      expect(isTagFormValid("meta", { tagId: "" })).toBe(false);
    });

    test("validates Microsoft Ads tag", () => {
      expect(isTagFormValid("microsoft", { tagId: "12345678" })).toBe(true);
      expect(isTagFormValid("microsoft", { tagId: "" })).toBe(false);
    });

    test("validates LinkedIn Business tag", () => {
      expect(isTagFormValid("linkedin", { tagId: "1234" })).toBe(true);
      expect(isTagFormValid("linkedin", { tagId: "" })).toBe(false);
    });

    test("validates TikTok Business tag", () => {
      expect(isTagFormValid("tiktok", { tagId: "1234" })).toBe(true);
      expect(isTagFormValid("tiktok", { tagId: "" })).toBe(false);
    });

    test("validates Twitter tag", () => {
      expect(isTagFormValid("twitter", { tagId: "1234" })).toBe(true);
      expect(isTagFormValid("twitter", { tagId: "" })).toBe(false);
    });
  });

  describe("Edge cases", () => {
    test("handles undefined field values", () => {
      const result = isTagFormValid("google", { tagId: undefined as any });
      expect(result).toBe(false);
    });

    test("handles null field values", () => {
      const result = isTagFormValid("google", { tagId: null as any });
      expect(result).toBe(false);
    });

    test("ignores extra fields not in platform config", () => {
      const result = isTagFormValid("google", {
        tagId: "G-123",
        extraField: "ignored",
      });
      expect(result).toBe(true);
    });
  });
});
