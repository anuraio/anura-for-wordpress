import { getPlatformOptions as getBasePlatformOptions, PLATFORMS } from "~/config/platforms";
import { ExclusionAudience } from "~/schemas/settings.schema";

export type PlatformOption =
  | {
      value: string;
      label: string;
      isRestricted: false;
    }
  | {
      value: string;
      label: string;
      isRestricted: true;
      tooltipMessage: string;
      activeCount: number;
      maxActive: number;
    };

export const PLATFORM_LIMITS = {
  linkedin: 1,
  taboola: 1,
  outbrain: 1,
  twitter: 1,
} as const;

export function getPlatformStatus(
  platform: string,
  existingAudiences: ExclusionAudience[],
  editingId?: string
): {
  isRestricted: boolean;
  activeCount: number;
  maxActive?: number;
  tooltipMessage?: string;
} {
  const maxActive = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];

  if (!maxActive) {
    return { isRestricted: false, activeCount: 0 };
  }

  // Count active audiences for this platform (excluding the one being edited)
  const activeCount = existingAudiences.filter(
    (audience) =>
      audience.platform === platform &&
      audience.enabled &&
      audience.id !== editingId
  ).length;

  const isRestricted = activeCount >= maxActive;
  const platformName =
    PLATFORMS[platform as keyof typeof PLATFORMS]?.label || platform;

  let tooltipMessage;
  if (isRestricted) {
    tooltipMessage = `${platformName} only supports ${maxActive} active exclusion audience${
      maxActive === 1 ? "" : "s"
    } at a time. Deactivate your existing ${platformName} exclusion audience to activate this one.`;
  }

  return {
    isRestricted,
    activeCount,
    maxActive,
    tooltipMessage,
  };
}

export const getPlatformOptions = (
  existingAudiences: ExclusionAudience[],
  editingId?: string
): PlatformOption[] => {
  const basePlatforms = getBasePlatformOptions();

  return basePlatforms.map((option): PlatformOption => {
    if (!option.value) {
      return { ...option, isRestricted: false };
    }

    const status = getPlatformStatus(
      option.value,
      existingAudiences,
      editingId
    );

    if (status.isRestricted) {
      return {
        value: option.value,
        label: option.label,
        isRestricted: true,
        tooltipMessage: status.tooltipMessage!,
        activeCount: status.activeCount,
        maxActive: status.maxActive!,
      };
    }

    return {
      value: option.value,
      label: option.label,
      isRestricted: false,
    };
  });
};
