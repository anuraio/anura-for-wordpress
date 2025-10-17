import { TAG_PLATFORMS } from "~/config/tagPlatforms";

// Form validation
export const isTagFormValid = (
  platform: keyof typeof TAG_PLATFORMS | "",
  fields: Record<string, string>
): boolean => {
  if (!platform) return false;

  const config = TAG_PLATFORMS[platform];
  if (!config) return false;

  // Check that all required fields have values
  return config.fields.every(
    (field) => fields[field.id] && fields[field.id].trim().length > 0
  );
};
