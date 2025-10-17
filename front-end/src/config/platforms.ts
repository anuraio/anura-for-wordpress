export const PLATFORMS = {
  meta: {
    label: "Meta Business",
    fields: [
      { id: "pixelId", label: "Pixel ID", placeholder: "Enter Pixel ID" },
    ],
  },
  google: {
    label: "Google Ads",
    fields: [
      { id: "adTagId", label: "Ad Tag ID", placeholder: "Enter Ad Tag ID" },
    ],
  },
  microsoft: {
    label: "Microsoft Ads",
    fields: [
      { id: "uetTagId", label: "UET Tag ID", placeholder: "Enter UET Tag ID" },
    ],
  },
  linkedin: {
    label: "LinkedIn Business",
    fields: [
      { id: "partnerId", label: "Partner ID", placeholder: "Enter Partner ID" },
      { id: "event", label: "Custom Event Code", placeholder: "Enter Custom Event Code" },
    ],
  },
  snapchat: {
    label: "Snapchat Ads",
    fields: [
      { id: "pixelId", label: "Pixel ID", placeholder: "Enter Pixel ID" },
    ],
  },
  tiktok: {
    label: "TikTok Business",
    fields: [
      { id: "pixelId", label: "Pixel ID", placeholder: "Enter Pixel ID" },
    ],
  },
  x: {
    label: "X Ads",
    fields: [
      { id: "eventId", label: "Event ID", placeholder: "Enter Event ID" },
    ],
  },
  pinterest: {
    label: "Pinterest Business",
    fields: [
      { id: "tagId", label: "Tag ID", placeholder: "Enter Tag ID" },
    ],
  },
  taboola: {
    label: "Taboola Ads",
    fields: [
      { id: "accountId", label: "Account ID", placeholder: "Enter Account ID" },
    ],
  },
  outbrain: {
    label: "Outbrain",
    fields: [
      { id: "advertiserId", label: "Advertiser ID", placeholder: "Enter Advertiser ID" },
    ],
  },
} as const;

export const getPlatformOptions = () => [
  { value: "", label: "Select platform..." },
  ...Object.entries(PLATFORMS).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

export const getPlatformLabel = (platform: string): string => {
  return PLATFORMS[platform as keyof typeof PLATFORMS]?.label || platform;
};