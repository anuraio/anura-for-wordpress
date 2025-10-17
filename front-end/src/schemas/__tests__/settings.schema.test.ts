import {
  transformToAPIPayload,
  transformFromAPIPayload,
  UISettings,
  AnuraSettings,
  getDefaultBotPatterns,
  getDefaultUISettings,
  BotPatternSchema,
  RequestTriggerSchema,
} from "../settings.schema";
import { describe, test, expect } from "vitest";

const createBaseUI = (overrides: Partial<UISettings> = {}): UISettings => ({
  instanceId: "123",
  sourceMethod: "get",
  sourceValue: "source-value",
  campaignMethod: "post",
  campaignValue: "campaign-value",
  callbackFunction: "myCallbackFunction",
  additionalData: [{ method: "hardCoded", value: "data-value" }],
  redirectCondition: "onBad",
  redirectURL: "https://fakeurl.com",
  webCrawlersAllowed: false,
  ignoreBots: false,
  botWhitelist: [],
  disableFormsEnabled: false,
  disableFormsCondition: "noDisable",
  disableCommentSubmitsEnabled: true,
  disableCommentSubmitsCondition: "onWarning",
  disableAllSubmitsEnabled: false,
  disableAllSubmitsCondition: "noDisable",
  disableLinksEnabled: false,
  disableLinksCondition: "noDisable",
  disableAllInputsEnabled: false,
  disableAllInputsCondition: "noDisable",
  protectLoginEnabled: false,
  protectLoginCondition: "noDisable",
  retryDurationSeconds: "4",
  stopAfterFirstElement: false,
  blockedLoginRetentionDays: '90',
  fallbackSources: ["", ""],
  fallbackCampaigns: ["", ""],
  addHeaders: false,
  headerPriority: "lowest",
  contentDeploymentEnabled: false,
  contentDeploymentCode: "",
  requestTriggersEnabled: false,
  requestTriggers: [],
  exclusionAudiences: [],
  retargetingProtection: [],
  ...overrides,
});

const createBaseAPI = (
  overrides: Partial<AnuraSettings> = {}
): AnuraSettings => ({
  script: {
    instanceId: 123,
    sourceMethod: "get",
    sourceValue: "source-value",
    campaignMethod: "post",
    campaignValue: "campaign-value",
    callbackFunction: "myCallbackFunction",
    additionalData: [{ method: "hardCoded", value: "data-value" }],
  },
  realTimeActions: {
    redirectAction: {
      resultCondition: "onBad",
      redirectURL: "https://fakeurl.com",
      webCrawlersAllowed: false,
    },
    actions: [
      { name: "disableForms", resultCondition: "noDisable" },
      { name: "disableCommentSubmits", resultCondition: "onWarning" },
      { name: "disableAllSubmits", resultCondition: "noDisable" },
      { name: "disableLinks", resultCondition: "noDisable" },
      { name: "disableAllInputs", resultCondition: "noDisable" },
      { name: "protectLogin", resultCondition: "noDisable" },
    ],
    retryDurationSeconds: 4,
    stopAfterFirstElement: false,
  },
  bots: {
    enabled: false,
    whitelist: [],
  },
  social: {
    exclusionAudiences: [],
    retargetingProtection: [],
  },
  advanced: {
    fallbacks: {
      sources: ["", ""],
      campaigns: ["", ""],
    },
    serverActions: {
      addHeaders: false,
      headerPriority: "lowest",
    },
    contentDeployment: {
      enabled: false,
      javascript: "",
    },
    requestTriggers: {
      enabled: false,
      triggers: [],
    },
  },
  logs: {
    blockedLoginRetentionDays: 90
  },
  ...overrides,
});

describe("transformToAPIPayload", () => {
  test("converts string instanceId to number", () => {
    const ui = createBaseUI();
    const api = transformToAPIPayload(ui);

    expect(api.script.instanceId).toBe(123);
  });

  test("handles non-numeric instanceId", () => {
    const ui = createBaseUI({ instanceId: "abc123" });
    const api = transformToAPIPayload(ui);

    expect(api.script.instanceId).toBe(NaN);
  });

  test("handles empty additionalData array", () => {
    const ui = createBaseUI({ additionalData: [] });
    const api = transformToAPIPayload(ui);

    expect(api.script.additionalData).toStrictEqual([]);
  });

  test("handles maximum retryDurationSeconds", () => {
    const ui = createBaseUI({ retryDurationSeconds: "120" });
    const api = transformToAPIPayload(ui);

    expect(api.realTimeActions.retryDurationSeconds).toBe(120);
  });

  test("includes protectLogin action in API payload", () => {
    const ui = createBaseUI({
      protectLoginEnabled: true,
      protectLoginCondition: "onBad",
    });
    const api = transformToAPIPayload(ui);

    const protectLoginAction = api.realTimeActions.actions.find(
      (a) => a.name === "protectLogin"
    );
    expect(protectLoginAction).toBeDefined();
    expect(protectLoginAction?.resultCondition).toBe("onBad");
  });

  test("transforms request triggers correctly", () => {
    const ui = createBaseUI({
      requestTriggersEnabled: true,
      requestTriggers: [
        {
          id: "test-trigger",
          type: "url",
          condition: "contains",
          pattern: "example.com",
          enabled: true,
        },
      ],
    });
    const api = transformToAPIPayload(ui);

    expect(api.advanced.requestTriggers.enabled).toBe(true);
    expect(api.advanced.requestTriggers.triggers).toHaveLength(1);
    expect(api.advanced.requestTriggers.triggers[0].pattern).toBe(
      "example.com"
    );
  });

  test("transforms content deployment fields correctly", () => {
    const ui = createBaseUI({
      contentDeploymentEnabled: true,
      contentDeploymentCode: "console.log('test');",
    });
    const api = transformToAPIPayload(ui);

    expect(api.advanced.contentDeployment.enabled).toBe(true);
    expect(api.advanced.contentDeployment.javascript).toBe(
      "console.log('test');"
    );
  });

  test("preserves all action conditions correctly", () => {
    const ui = createBaseUI({
      disableFormsCondition: "onBoth",
      disableLinksCondition: "onWarning",
      protectLoginCondition: "onBad",
    });
    const api = transformToAPIPayload(ui);

    expect(
      api.realTimeActions.actions.find((a) => a.name === "disableForms")
        ?.resultCondition
    ).toBe("onBoth");
    expect(
      api.realTimeActions.actions.find((a) => a.name === "disableLinks")
        ?.resultCondition
    ).toBe("onWarning");
    expect(
      api.realTimeActions.actions.find((a) => a.name === "protectLogin")
        ?.resultCondition
    ).toBe("onBad");
  });
});

describe("transformFromAPIPayload", () => {
  test("converts number instanceId to string", () => {
    const api = createBaseAPI();
    const ui = transformFromAPIPayload(api);

    expect(ui.instanceId).toBe("123");
  });

  test("converts number retryDurationSeconds to string", () => {
    const api = createBaseAPI({
      realTimeActions: {
        ...createBaseAPI().realTimeActions,
        retryDurationSeconds: 30,
      },
    });
    const ui = transformFromAPIPayload(api);

    expect(ui.retryDurationSeconds).toBe("30");
  });

  test("extracts action conditions to flat structure", () => {
    const api = createBaseAPI();
    const ui = transformFromAPIPayload(api);

    expect(ui.disableCommentSubmitsCondition).toBe("onWarning");
    expect(ui.disableFormsCondition).toBe("noDisable");
    expect(ui.protectLoginCondition).toBe("noDisable");
  });

  test("extracts protectLogin settings correctly", () => {
    const api = createBaseAPI({
      realTimeActions: {
        ...createBaseAPI().realTimeActions,
        actions: [
          ...createBaseAPI().realTimeActions.actions.filter(
            (a) => a.name !== "protectLogin"
          ),
          { name: "protectLogin", resultCondition: "onBad" },
        ],
      },
    });
    const ui = transformFromAPIPayload(api);

    expect(ui.protectLoginEnabled).toBe(true);
    expect(ui.protectLoginCondition).toBe("onBad");
  });

  test("extracts request triggers correctly", () => {
    const api = createBaseAPI({
      advanced: {
        ...createBaseAPI().advanced,
        requestTriggers: {
          enabled: true,
          triggers: [
            {
              id: "test-trigger",
              type: "url",
              condition: "contains",
              pattern: "example.com",
              enabled: true,
            },
          ],
        },
      },
    });
    const ui = transformFromAPIPayload(api);

    expect(ui.requestTriggersEnabled).toBe(true);
    expect(ui.requestTriggers).toHaveLength(1);
    expect(ui.requestTriggers[0].pattern).toBe("example.com");
  });

  test("handles missing optional fields gracefully", () => {
    const minimalAPI: AnuraSettings = {
      script: {
        instanceId: 456,
        sourceMethod: "none",
        sourceValue: "",
        campaignMethod: "none",
        campaignValue: "",
        callbackFunction: "",
        additionalData: [],
      },
      realTimeActions: {
        redirectAction: {
          resultCondition: "noRedirect",
          redirectURL: "",
          webCrawlersAllowed: false,
        },
        actions: [],
        retryDurationSeconds: 4,
        stopAfterFirstElement: false,
      },
      bots: { enabled: false, whitelist: [] },
      social: { exclusionAudiences: [], retargetingProtection: [] },
      advanced: {
        fallbacks: { sources: ["", ""], campaigns: ["", ""] },
        serverActions: { addHeaders: false, headerPriority: "medium" },
        contentDeployment: { enabled: false, javascript: "" },
        requestTriggers: { enabled: false, triggers: [] },
      },
      logs: {
        blockedLoginRetentionDays: 90
      }
    };

    const ui = transformFromAPIPayload(minimalAPI);

    expect(ui.instanceId).toBe("456");
    expect(ui.additionalData).toStrictEqual([]);
    expect(ui.requestTriggersEnabled).toBe(false);
  });

  describe("edge cases", () => {
    test("handles very large instanceId", () => {
      const ui = createBaseUI({ instanceId: "999999999" });
      const api = transformToAPIPayload(ui);

      expect(api.script.instanceId).toBe(999999999);
    });

    test("handles special characters in values", () => {
      const ui = createBaseUI({
        sourceValue: "test@value#123",
        campaignValue: "campaign&test=true",
      });
      const api = transformToAPIPayload(ui);

      expect(api.script.sourceValue).toBe("test@value#123");
      expect(api.script.campaignValue).toBe("campaign&test=true");
    });

    test("handles all action conditions", () => {
      const conditions = ["noDisable", "onWarning", "onBad", "onBoth"] as const;

      conditions.forEach((condition) => {
        const ui = createBaseUI({ disableFormsCondition: condition });
        const api = transformToAPIPayload(ui);

        const action = api.realTimeActions.actions.find(
          (a) => a.name === "disableForms"
        );
        expect(action?.resultCondition).toBe(condition);
      });
    });

    test("handles maximum additional data items", () => {
      const maxItems = Array.from({ length: 10 }, (_, i) => ({
        method: "hardCoded" as const,
        value: `item-${i}`,
      }));

      const ui = createBaseUI({ additionalData: maxItems });
      const api = transformToAPIPayload(ui);

      expect(api.script.additionalData).toHaveLength(10);
      expect(api.script.additionalData[9].value).toBe("item-9");
    });

    test("transforms boolean flags correctly", () => {
      const ui = createBaseUI({
        webCrawlersAllowed: true,
        stopAfterFirstElement: true,
        addHeaders: true,
      });
      const api = transformToAPIPayload(ui);

      expect(api.realTimeActions.redirectAction.webCrawlersAllowed).toBe(true);
      expect(api.realTimeActions.stopAfterFirstElement).toBe(true);
      expect(api.advanced.serverActions.addHeaders).toBe(true);
    });
  });
});

describe("getDefaultUISettings", () => {
  test("returns valid default settings", () => {
    const defaults = getDefaultUISettings();

    expect(defaults.instanceId).toBe("");
    expect(defaults.additionalData).toHaveLength(10);
    expect(defaults.botWhitelist.length).toBeGreaterThan(0);
  });

  test("additional data has correct default structure", () => {
    const defaults = getDefaultUISettings();

    defaults.additionalData.forEach((item) => {
      expect(item).toHaveProperty("method");
      expect(item).toHaveProperty("value");
      expect(item.method).toBe("get");
      expect(item.value).toBe("");
    });
  });
});

describe("getDefaultBotPatterns", () => {
  test("returns predefined bot patterns", () => {
    const patterns = getDefaultBotPatterns();

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.every((p) => !p.isCustom)).toBe(true);
  });

  test("all patterns have required fields", () => {
    const patterns = getDefaultBotPatterns();

    patterns.forEach((pattern) => {
      expect(pattern).toHaveProperty("id");
      expect(pattern).toHaveProperty("name");
      expect(pattern).toHaveProperty("pattern");
      expect(pattern).toHaveProperty("enabled");
      expect(typeof pattern.enabled).toBe("boolean");
    });
  });
});

describe("RequestTriggerSchema validation", () => {
  test("accepts valid regex patterns", () => {
    const validTrigger = {
      id: "test",
      type: "url",
      condition: "contains",
      pattern: "example\\.com",
      enabled: true,
    };

    expect(() => RequestTriggerSchema.parse(validTrigger)).not.toThrow();
  });

  test("rejects invalid regex patterns", () => {
    const invalidTrigger = {
      id: "test",
      type: "url",
      condition: "contains",
      pattern: "[invalid-regex",
      enabled: true,
    };

    expect(() => RequestTriggerSchema.parse(invalidTrigger)).toThrow(
      "Invalid regex pattern"
    );
  });
});

describe("BotPatternSchema validation", () => {
  test("accepts valid regex patterns", () => {
    const validBot = {
      id: "test-bot",
      name: "Test Bot",
      type: "userAgent",
      pattern: "bot.*crawler",
      enabled: true,
      isCustom: false,
    };

    expect(() => BotPatternSchema.parse(validBot)).not.toThrow();
  });

  test("rejects invalid regex patterns", () => {
    const invalidBot = {
      id: "test-bot",
      name: "Test Bot",
      type: "userAgent",
      pattern: "*invalid[regex",
      enabled: true,
      isCustom: false,
    };

    expect(() => BotPatternSchema.parse(invalidBot)).toThrow(
      "Invalid regex pattern"
    );
  });
});

describe("getDefaultBotPatterns coverage", () => {
  test("includes all expected platform patterns", () => {
    const patterns = getDefaultBotPatterns();

    const platforms = [
      "google",
      "meta",
      "linkedin",
      "microsoft",
      "snapchat",
      "other",
    ];
    platforms.forEach((platform) => {
      const hasPlatform = patterns.some((p) => p.platform === platform);
      expect(hasPlatform).toBe(true);
    });
  });

  test("all patterns have valid regex", () => {
    const patterns = getDefaultBotPatterns();

    patterns.forEach((pattern) => {
      expect(() => new RegExp(pattern.pattern, "i")).not.toThrow();
    });
  });
});
