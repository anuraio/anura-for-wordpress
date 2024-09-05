import { z } from 'zod';

// Schema for Anura Script settings.
export const ScriptSchema = z.object({
  instanceId: z
    .coerce.bigint()
    .min(BigInt(1), "Your instance ID must be a positive number and at least 1 digit long.")
    .max(BigInt(1_000_000_000_000_000)),
  sourceMethod: z.enum(["none","hardCoded","get","post"], {
    errorMap: () => ({ message: "You can only use one of the 4 options for source method."})
  }),
  sourceValue: z.string().max(128, "Source cannot be longer than 128 characters."),
  campaignMethod: z.enum(["none","hardCoded","get","post"], {
    errorMap: () => ({ message: "You can only use one of the 4 options for campaign method."})
  }),
  campaignValue: z.string().max(128, "Campaign cannot be longer than 128 characters."),
  callbackFunction: z.string().max(256, "Callback function cannot be longer than 256 characters."),
  additionalData: z
    .array(
      z.string()
      .max(128, "Additional data elements cannot be longer than 128 characters.")
    )
    .min(1)
    .max(10, "You must have between 1 and 10 elements of additional data.")
});

// Schema for fallback sources & campaigns
export const FallbackSchema = z.object({
  sources: z
    .array(z.string().max(128, "Fallback sources cannot be longer than 128 characters."))
    .length(2, "You can only have 2 fallback sources."),
  campaigns: z
    .array(z.string().max(128, "Fallback campaigns cannot be longer than 128 characters."))
    .length(2, "You can only have 2 fallback campaigns."),
});

// Schema for a real time action
const actionSchema = z.object({
  name: z.string(),
  resultCondition: z.enum(["noDisable", "onWarning", "onBad", "onBoth"], {
    errorMap: () => ({ message: "You can only use one of the 4 options for redirecting traffic."})
  }),
});

// Schema for Real Time settings.
export const RealTimeSchema = z.object({
  redirectAction: z.object({
    resultCondition: z.enum(["noRedirect", "onWarning", "onBad", "onBoth"], {
      errorMap: () => ({ message: "You can only use one of the 4 options for real time actions."})
    }),
    redirectURL: z.string().max(256, "Redirect URL cannot be longer than 256 characters."),
    webCrawlersAllowed: z.boolean({message: 'Only True/False values are allowed for the "Allow Web crawlers to bypass redirect" setting.'})
  }),
  actions: z.array(actionSchema),
  retryDurationSeconds: z.coerce.bigint().max(BigInt(120), "Retry duration cannot be greater than 120 seconds."),
  stopAfterFirstElement: z.boolean({message: 'Only True/False values are allowed for the "Stop searching after the first element is found" setting.'})
});

export const ServerActionsSchema = z.object({
  addHeaders: z.boolean({message: 'Only True/False values are allowed for the "Add headers" setting.'}),
  headerPriority: z.enum(["lowest","low","medium","high","highest"], {
    errorMap: () => ({ message: "You can only use one of the 5 options for header priority."})
  })
})

export const getDefaultSettings = (): AnuraSettings => {
  return {
    script: {
      instanceId: "",
      sourceMethod: "none",
      sourceValue: "",
      campaignMethod: "none",
      campaignValue: "",
      callbackFunction: "",
      additionalData: [""],
    },
    fallbacks: {
      sources: ["", ""],
      campaigns: ["", ""]
    },
    realTimeActions: {
      redirectAction: {
        resultCondition: "noRedirect",
        redirectURL: "",
        webCrawlersAllowed: false
      },
      actions: [
        { name: "disableForms", resultCondition: "noDisable" },
        { name: "disableCommentSubmits", resultCondition: "noDisable" },
        { name: "disableAllSubmits", resultCondition: "noDisable" },
        { name: "disableLinks", resultCondition: "noDisable" },
        { name: "disableAllInputs", resultCondition: "noDisable"}
      ],
      retryDurationSeconds: 4,
      stopAfterFirstElement: false
    },
    serverActions: {
      addHeaders: false,
      headerPriority: "medium"
    }
  };
};
