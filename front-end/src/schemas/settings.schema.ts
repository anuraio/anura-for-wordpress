import { z } from "zod";

export const AdditionalDataItemSchema = z.object({
  method: z.enum(["hardCoded", "get", "post"]),
  value: z
    .string()
    .max(128, "Additional data elements cannot be longer than 128 characters."),
});

export const ScriptSchema = z.object({
  instanceId: z
    .number()
    .int("Instance ID must be a whole number")
    .min(1, "Instance ID must be at least 1")
    .max(Number.MAX_SAFE_INTEGER, "Instance ID is too large"),
  sourceMethod: z.enum(["none", "hardCoded", "get", "post"], {
    error: "You can only use one of the 4 options for source method.",
  }),
  sourceValue: z
    .string()
    .max(128, "Source cannot be longer than 128 characters."),
  campaignMethod: z.enum(["none", "hardCoded", "get", "post"], {
    error: "You can only use one of the 4 options for campaign method.",
  }),
  campaignValue: z
    .string()
    .max(128, "Campaign cannot be longer than 128 characters."),
  additionalData: z
    .array(AdditionalDataItemSchema)
    .min(1)
    .max(10, "You must have between 1 and 10 elements of additional data."),
  callbackFunction: z
    .string()
    .max(256, "Callback function cannot be longer than 256 characters."),
});

const ActionSchema = z.object({
  name: z.string(),
  resultCondition: z.enum(["noDisable", "onWarning", "onBad", "onBoth"], {
    error: "You can only use one of the 4 options for real time actions.",
  }),
});

export const RealTimeSchema = z.object({
  redirectAction: z.object({
    resultCondition: z.enum(["noRedirect", "onWarning", "onBad", "onBoth"], {
      error: "You can only use one of the 4 options for redirecting traffic.",
    }),
    redirectURL: z
      .string()
      .max(256, "Redirect URL cannot be longer than 256 characters."),
    webCrawlersAllowed: z.boolean({
      message:
        'Only True/False values are allowed for the "Allow Web crawlers to bypass redirect" setting.',
    }),
  }),
  actions: z.array(ActionSchema),
  retryDurationSeconds: z
    .number()
    .int("Retry duration must be a whole number")
    .min(1, "Retry duration must be at least 1 second")
    .max(120, "Retry duration cannot be greater than 120 seconds"),
  stopAfterFirstElement: z.boolean({
    message:
      'Only True/False values are allowed for the "Stop searching after the first element is found" setting.',
  }),
});

export const RequestTriggerSchema = z.object({
  id: z.string(),
  type: z.enum(["url", "queryParam", "path"]),
  condition: z.enum(["contains", "doesNotContain"]),
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .refine((pattern) => {
      try {
        new RegExp(pattern, "i");
        return true;
      } catch {
        return false;
      }
    }, "Invalid regex pattern"),
  enabled: z.boolean(),
});

export const AdvancedSchema = z.object({
  fallbacks: z.object({
    sources: z
      .array(
        z
          .string()
          .max(128, "Fallback sources cannot be longer than 128 characters.")
      )
      .length(2, "You can only have 2 fallback sources."),
    campaigns: z
      .array(
        z
          .string()
          .max(128, "Fallback campaigns cannot be longer than 128 characters.")
      )
      .length(2, "You can only have 2 fallback campaigns."),
  }),
  serverActions: z.object({
    addHeaders: z.boolean({
      message:
        'Only True/False values are allowed for the "Add headers" setting.',
    }),
    headerPriority: z.enum(["lowest", "low", "medium", "high", "highest"], {
      error: "You can only use one of the 5 options for header priority.",
    }),
  }),
  contentDeployment: z.object({
    enabled: z.boolean({
      message:
        'Only True/False values are allowed for the "Enable content deployment" setting.',
    }),
    javascript: z
      .string()
      .max(
        10000,
        "Content deployment code cannot be longer than 10000 characters."
      ),
  }),
  requestTriggers: z.object({
    enabled: z.boolean().default(false),
    triggers: z.array(RequestTriggerSchema).default([]),
  }),
});

export const ExclusionAudienceSchema = z.object({
  id: z.string().min(1, "ID is required"),
  platform: z.string().min(1, "Platform is required"),
  label: z.string().optional(),
  fields: z.record(z.string(), z.string()),
  enabled: z.boolean(),
});

export const ProtectedTagSchema = z.object({
  id: z.string(),
  platform: z.enum([
    "google",
    "meta",
    "microsoft",
    "linkedin",
    "tiktok",
    "twitter",
  ]),
  tagId: z.string().min(1, "Tag ID is required"),
  label: z.string().optional(),
  enabled: z.boolean(),
});

export const BotPatternSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Bot name is required"),
  platform: z
    .enum(["google", "meta", "microsoft", "linkedin", "snapchat", "other"])
    .optional(),
  type: z.enum(["userAgent", "location", "referrer"]),
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .refine((pattern) => {
      try {
        new RegExp(pattern, "i");
        return true;
      } catch {
        return false;
      }
    }, "Invalid regex pattern"),
  enabled: z.boolean(),
  isCustom: z.boolean().default(false),
});

export const LogsSchema = z.object({
  blockedLoginRetentionDays: z
    .number()
    .int("Retention days must be a whole number")
    .min(1, "Retention days must be at least 1")
    .max(365, "Retention days cannot be greater than 365")
    .default(90),
});

export const AnuraSettingsSchema = z.object({
  script: ScriptSchema,
  realTimeActions: RealTimeSchema,
  bots: z.object({
    enabled: z.boolean().default(false),
    whitelist: z.array(BotPatternSchema).default([]),
  }),
  social: z.object({
    exclusionAudiences: z.array(ExclusionAudienceSchema),
    retargetingProtection: z.array(ProtectedTagSchema),
  }),
  advanced: AdvancedSchema,
  logs: LogsSchema,
});

export const UISettingsSchema = z.object({
  instanceId: z
    .string()
    .min(1, "Instance ID is required")
    .regex(/^\d+$/, "Instance ID must contain only numbers")
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= Number.MAX_SAFE_INTEGER;
    }, "Instance ID must be a valid positive number"),
  sourceMethod: z.enum(["none", "hardCoded", "get", "post"], {
    error: "You can only use one of the 4 options for source method.",
  }),
  sourceValue: z
    .string()
    .max(128, "Source cannot be longer than 128 characters."),
  campaignMethod: z.enum(["none", "hardCoded", "get", "post"], {
    error: "You can only use one of the 4 options for campaign method.",
  }),
  campaignValue: z
    .string()
    .max(128, "Campaign cannot be longer than 128 characters."),
  callbackFunction: z
    .string()
    .max(256, "Callback function cannot be longer than 256 characters."),
  additionalData: z
    .array(AdditionalDataItemSchema)
    .min(1, "You must have at least 1 additional data element.")
    .max(10, "You must have between 1 and 10 elements of additional data."),
  redirectCondition: z.enum(["noRedirect", "onWarning", "onBad", "onBoth"], {
    error: "You can only use one of the 4 options for redirecting traffic.",
  }),
  redirectURL: z
    .string()
    .max(256, "Redirect URL cannot be longer than 256 characters."),
  webCrawlersAllowed: z.boolean({
    message:
      'Only True/False values are allowed for the "Allow Web crawlers to bypass redirect" setting.',
  }),
  ignoreBots: z.boolean().default(false),
  botWhitelist: z.array(BotPatternSchema).default([]),
  disableFormsEnabled: z.boolean().default(false),
  disableFormsCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  disableCommentSubmitsEnabled: z.boolean().default(false),
  disableCommentSubmitsCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  disableAllSubmitsEnabled: z.boolean().default(false),
  disableAllSubmitsCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  disableLinksEnabled: z.boolean().default(false),
  disableLinksCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  disableAllInputsEnabled: z.boolean().default(false),
  disableAllInputsCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  protectLoginEnabled: z.boolean().default(false),
  protectLoginCondition: z
    .enum(["noDisable", "onWarning", "onBad", "onBoth"])
    .default("noDisable"),
  blockedLoginRetentionDays: z
    .string()
    .min(1, "Retention days is required")
    .regex(/^\d+$/, "Retention days must contain only numbers")
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 365;
    }, "Retention days must be between 1 and 365")
    .default("90"),
  retryDurationSeconds: z
    .string()
    .min(1, "Retry duration is required")
    .regex(/^\d+$/, "Retry duration must contain only numbers")
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 120;
    }, "Retry duration must be between 1 and 120 seconds"),
  stopAfterFirstElement: z.boolean({
    message:
      'Only True/False values are allowed for the "Stop searching after the first element is found" setting.',
  }),
  fallbackSources: z
    .array(
      z
        .string()
        .max(128, "Fallback sources cannot be longer than 128 characters.")
    )
    .length(2, "You can only have 2 fallback sources."),
  fallbackCampaigns: z
    .array(
      z
        .string()
        .max(128, "Fallback campaigns cannot be longer than 128 characters.")
    )
    .length(2, "You can only have 2 fallback campaigns."),
  addHeaders: z.boolean({
    message:
      'Only True/False values are allowed for the "Add headers" setting.',
  }),
  headerPriority: z.enum(["lowest", "low", "medium", "high", "highest"], {
    error: "You can only use one of the 5 options for header priority.",
  }),
  contentDeploymentEnabled: z.boolean().default(false),
  contentDeploymentCode: z
    .string()
    .max(
      10000,
      "Content deployment code cannot be longer than 10000 characters."
    )
    .default(""),
  requestTriggersEnabled: z.boolean().default(false),
  requestTriggers: z.array(RequestTriggerSchema).default([]),
  exclusionAudiences: z.array(ExclusionAudienceSchema).default([]),
  retargetingProtection: z.array(ProtectedTagSchema).default([]),
});

export type AnuraSettings = z.infer<typeof AnuraSettingsSchema>;
export type UISettings = z.infer<typeof UISettingsSchema>;
export type ExclusionAudience = z.infer<typeof ExclusionAudienceSchema>;
export type AdditionalDataItem = z.infer<typeof AdditionalDataItemSchema>;
export type BotPattern = z.infer<typeof BotPatternSchema>;
export type RequestTrigger = z.infer<typeof RequestTriggerSchema>;

export const getDefaultBotPatterns = (): BotPattern[] => [
  // Meta/Facebook Advertising Bots
  {
    id: "facebook_external",
    name: "Meta Business Suite (External)",
    platform: "meta",
    type: "userAgent",
    pattern: "facebookexternalhit",
    enabled: false,
    isCustom: false,
  },
  {
    id: "facebook_catalog",
    name: "Meta Business Suite (Catalog)",
    platform: "meta",
    type: "userAgent",
    pattern: "facebookcatalog",
    enabled: false,
    isCustom: false,
  },

  // Google Advertising & Analytics Bots
  {
    id: "adsbot_google",
    name: "Google Ads (AdsBot-Google)",
    platform: "google",
    type: "userAgent",
    pattern: "AdsBot-Google",
    enabled: false,
    isCustom: false,
  },
  {
    id: "adsbot",
    name: "Google Ads (AdsBot)",
    platform: "google",
    type: "userAgent",
    pattern: "AdsBot",
    enabled: false,
    isCustom: false,
  },
  {
    id: "google_ads_dmbrowser",
    name: "Google Ads (DMBrowser)",
    platform: "google",
    type: "userAgent",
    pattern: "DMBrowser",
    enabled: false,
    isCustom: false,
  },
  {
    id: "googlebot",
    name: "Google (Googlebot)",
    platform: "google",
    type: "userAgent",
    pattern: "Googlebot",
    enabled: false,
    isCustom: false,
  },
  {
    id: "google_other",
    name: "Google (GoogleOther)",
    platform: "google",
    type: "userAgent",
    pattern: "GoogleOther",
    enabled: false,
    isCustom: false,
  },
  {
    id: "google_adsense",
    name: "Google AdSense",
    platform: "google",
    type: "userAgent",
    pattern: "GoogleAdSenseInfeed",
    enabled: false,
    isCustom: false,
  },
  {
    id: "google_media_partners",
    name: "Google Media Partners",
    platform: "google",
    type: "userAgent",
    pattern: "Mediapartners-Google",
    enabled: false,
    isCustom: false,
  },

  // LinkedIn Advertising Bots
  {
    id: "linkedin_ads",
    name: "LinkedIn Ads",
    platform: "linkedin",
    type: "userAgent",
    pattern: "LinkedInBot",
    enabled: false,
    isCustom: false,
  },

  // Microsoft Advertising Bots
  {
    id: "microsoft_ads",
    name: "Microsoft Ads",
    platform: "microsoft",
    type: "userAgent",
    pattern: "Microsoft-BotFramework",
    enabled: false,
    isCustom: false,
  },

  // Snapchat Advertising Bots
  {
    id: "snapchat_ads",
    name: "Snapchat Ads",
    platform: "snapchat",
    type: "userAgent",
    pattern: "SnapchatAds",
    enabled: false,
    isCustom: false,
  },

  // SEO & Marketing Tools
  {
    id: "semrush",
    name: "Semrush",
    platform: "other",
    type: "userAgent",
    pattern: "Semrush",
    enabled: false,
    isCustom: false,
  },

  // MOAT (Ad Verification)
  {
    id: "moat_bot",
    name: "MOAT (Bot)",
    platform: "other",
    type: "userAgent",
    pattern: "moatbot",
    enabled: false,
    isCustom: false,
  },
  {
    id: "moat_ping",
    name: "MOAT (Ping)",
    platform: "other",
    type: "userAgent",
    pattern: "pingbot",
    enabled: false,
    isCustom: false,
  },
];

export const getDefaultUISettings = (): UISettings => {
  return {
    instanceId: "",
    sourceMethod: "none",
    sourceValue: "",
    campaignMethod: "none",
    campaignValue: "",
    callbackFunction: "",
    ignoreBots: false,
    botWhitelist: getDefaultBotPatterns(),
    additionalData: Array.from({ length: 10 }, () => ({
      method: "get",
      value: "",
    })),
    redirectCondition: "noRedirect",
    redirectURL: "",
    webCrawlersAllowed: false,
    disableFormsEnabled: false,
    disableFormsCondition: "noDisable",
    disableCommentSubmitsEnabled: false,
    disableCommentSubmitsCondition: "noDisable",
    disableAllSubmitsEnabled: false,
    disableAllSubmitsCondition: "noDisable",
    disableLinksEnabled: false,
    disableLinksCondition: "noDisable",
    disableAllInputsEnabled: false,
    disableAllInputsCondition: "noDisable",
    retryDurationSeconds: "4",
    stopAfterFirstElement: false,
    protectLoginEnabled: false,
    protectLoginCondition: "noDisable",
    blockedLoginRetentionDays: "90",
    fallbackSources: ["", ""],
    fallbackCampaigns: ["", ""],
    addHeaders: false,
    headerPriority: "medium",
    contentDeploymentEnabled: false,
    contentDeploymentCode: "",
    requestTriggersEnabled: false,
    requestTriggers: [],
    exclusionAudiences: [],
    retargetingProtection: [],
  };
};

// Transform UI settings to API payload
export const transformToAPIPayload = (
  uiSettings: UISettings
): AnuraSettings => {
  return {
    script: {
      instanceId: parseInt(uiSettings.instanceId),
      sourceMethod: uiSettings.sourceMethod,
      sourceValue: uiSettings.sourceValue,
      campaignMethod: uiSettings.campaignMethod,
      campaignValue: uiSettings.campaignValue,
      additionalData: uiSettings.additionalData,
      callbackFunction: uiSettings.callbackFunction,
    },
    realTimeActions: {
      redirectAction: {
        resultCondition: uiSettings.redirectCondition,
        redirectURL: uiSettings.redirectURL,
        webCrawlersAllowed: uiSettings.webCrawlersAllowed,
      },
      actions: [
        {
          name: "disableForms",
          resultCondition: uiSettings.disableFormsCondition,
        },
        {
          name: "disableCommentSubmits",
          resultCondition: uiSettings.disableCommentSubmitsCondition,
        },
        {
          name: "disableAllSubmits",
          resultCondition: uiSettings.disableAllSubmitsCondition,
        },
        {
          name: "disableLinks",
          resultCondition: uiSettings.disableLinksCondition,
        },
        {
          name: "disableAllInputs",
          resultCondition: uiSettings.disableAllInputsCondition,
        },
        {
          name: "protectLogin",
          resultCondition: uiSettings.protectLoginCondition,
        },
      ],
      retryDurationSeconds: parseInt(uiSettings.retryDurationSeconds),
      stopAfterFirstElement: uiSettings.stopAfterFirstElement,
    },
    bots: {
      enabled: uiSettings.ignoreBots,
      whitelist: uiSettings.botWhitelist,
    },
    social: {
      exclusionAudiences: uiSettings.exclusionAudiences,
      retargetingProtection: uiSettings.retargetingProtection,
    },
    advanced: {
      fallbacks: {
        sources: uiSettings.fallbackSources,
        campaigns: uiSettings.fallbackCampaigns,
      },
      serverActions: {
        addHeaders: uiSettings.addHeaders,
        headerPriority: uiSettings.headerPriority,
      },
      contentDeployment: {
        enabled: uiSettings.contentDeploymentEnabled,
        javascript: uiSettings.contentDeploymentCode,
      },
      requestTriggers: {
        enabled: uiSettings.requestTriggersEnabled,
        triggers: uiSettings.requestTriggers,
      },
    },
    logs: {
      blockedLoginRetentionDays: parseInt(uiSettings.blockedLoginRetentionDays),
    },
  };
};

// Transform API payload to UI settings
export const transformFromAPIPayload = (
  apiSettings: AnuraSettings
): UISettings => {
  // Merge default bot patterns with API settings to ensure all bots are always displayed
  const defaultBots = getDefaultBotPatterns();
  const apiBots = apiSettings.bots?.whitelist ?? [];

  const apiBotsMap = new Map(apiBots.map((bot) => [bot.id, bot]));

  const mergedPredefinedBots = defaultBots.map((defaultBot) => {
    const apiBot = apiBotsMap.get(defaultBot.id);
    return apiBot || defaultBot;
  });

  // Add any custom bots from API that aren't in defaults
  const customBots = apiBots.filter((bot) => bot.isCustom);
  const botWhitelist = [...mergedPredefinedBots, ...customBots];

  const actionsMap = new Map(
    apiSettings.realTimeActions.actions.map((action) => [
      action.name,
      action.resultCondition,
    ])
  );

  const getActionState = (actionName: string) => {
    const condition = actionsMap.get(actionName) ?? "noDisable";
    return {
      enabled: condition !== "noDisable",
      condition,
    };
  };

  const disableForms = getActionState("disableForms");
  const disableCommentSubmits = getActionState("disableCommentSubmits");
  const disableAllSubmits = getActionState("disableAllSubmits");
  const disableLinks = getActionState("disableLinks");
  const disableAllInputs = getActionState("disableAllInputs");
  const protectLogin = getActionState("protectLogin");

  return {
    instanceId: apiSettings.script.instanceId.toString(),
    sourceMethod: apiSettings.script.sourceMethod,
    sourceValue: apiSettings.script.sourceValue,
    campaignMethod: apiSettings.script.campaignMethod,
    campaignValue: apiSettings.script.campaignValue,
    callbackFunction: apiSettings.script.callbackFunction,
    ignoreBots: apiSettings.bots?.enabled ?? false,
    botWhitelist: botWhitelist,
    additionalData: (apiSettings.script
      .additionalData as unknown as AdditionalDataItem[]) || [
      { method: "get", value: "" },
    ],
    redirectCondition:
      apiSettings.realTimeActions.redirectAction.resultCondition,
    redirectURL: apiSettings.realTimeActions.redirectAction.redirectURL,
    webCrawlersAllowed:
      apiSettings.realTimeActions.redirectAction.webCrawlersAllowed,
    retryDurationSeconds:
      apiSettings.realTimeActions.retryDurationSeconds.toString(),
    disableFormsEnabled: disableForms.enabled,
    disableFormsCondition: disableForms.condition,
    disableCommentSubmitsEnabled: disableCommentSubmits.enabled,
    disableCommentSubmitsCondition: disableCommentSubmits.condition,
    disableAllSubmitsEnabled: disableAllSubmits.enabled,
    disableAllSubmitsCondition: disableAllSubmits.condition,
    disableLinksEnabled: disableLinks.enabled,
    disableLinksCondition: disableLinks.condition,
    disableAllInputsEnabled: disableAllInputs.enabled,
    disableAllInputsCondition: disableAllInputs.condition,
    protectLoginEnabled: protectLogin.enabled,
    protectLoginCondition: protectLogin.condition,
    blockedLoginRetentionDays:
      apiSettings.logs?.blockedLoginRetentionDays?.toString() ?? "90",
    stopAfterFirstElement: apiSettings.realTimeActions.stopAfterFirstElement,
    fallbackSources: apiSettings.advanced?.fallbacks?.sources ?? ["", ""],
    fallbackCampaigns: apiSettings.advanced?.fallbacks?.campaigns ?? ["", ""],
    addHeaders: apiSettings.advanced?.serverActions?.addHeaders ?? false,
    headerPriority:
      apiSettings.advanced?.serverActions?.headerPriority ?? "medium",
    contentDeploymentEnabled:
      apiSettings.advanced?.contentDeployment?.enabled ?? false,
    contentDeploymentCode:
      apiSettings.advanced?.contentDeployment?.javascript ?? "",
    requestTriggersEnabled:
      apiSettings.advanced?.requestTriggers?.enabled ?? false,
    requestTriggers: apiSettings.advanced?.requestTriggers?.triggers ?? [],
    exclusionAudiences: apiSettings.social.exclusionAudiences || [],
    retargetingProtection: apiSettings.social.retargetingProtection || [],
  };
};
