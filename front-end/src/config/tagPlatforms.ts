export const TAG_PLATFORMS = {
  google: {
    label: "Google Ads",
    fields: [
      {
        id: "tagId",
        label: "Tag ID",
        placeholder: "G-XXXXXXXXXX or AW-XXXXXXXXXX",
      },
    ],
  },
  meta: {
    label: "Meta Business",
    fields: [
      { id: "tagId", label: "Pixel ID", placeholder: "123456789" },
    ],
  },
  microsoft: {
    label: "Microsoft Ads",
    fields: [{ id: "tagId", label: "UET Tag ID", placeholder: "123456789" }],
  },
  linkedin: {
    label: "LinkedIn Business",
    fields: [{ id: "tagId", label: "Partner ID", placeholder: "123456789" }],
  },
  tiktok: {
    label: "TikTok Business",
    fields: [{ id: "tagId", label: "Partner ID", placeholder: "123456789" }],
  },
  twitter: {
    label: "Twitter",
    fields: [{ id: "tagId", label: "Tag ID", placeholder: "123456789" }],
  },
} as const;
