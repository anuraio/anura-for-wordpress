import { z } from 'zod';
import { PLATFORMS } from '../config/platforms';
import { ExclusionAudience, ExclusionAudienceSchema } from '~/schemas/settings.schema';

// Validation result type for better error handling
export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

/**
 * Get display name for an audience (Platform name with optional label)
 * @param audience - The exclusion audience
 * @returns Formatted display name (e.g., "Meta Business" or "Meta Business - Campaign A")
 */
export const getDisplayName = (audience: ExclusionAudience): string => {
  const platformName = PLATFORMS[audience.platform as keyof typeof PLATFORMS]?.label || audience.platform;
  return audience.label ? `${platformName} - ${audience.label}` : platformName;
};

/**
 * Get the primary ID to display for an audience (first field value)
 * @param audience - The exclusion audience
 * @returns Primary field value or "Not set" if empty, "N/A" if platform not found
 */
export const getPrimaryId = (audience: ExclusionAudience): string | null => {
  const config = PLATFORMS[audience.platform as keyof typeof PLATFORMS];
  if (!config) return null;
  
  const primaryField = config.fields[0];
  return audience.fields[primaryField.id] || "Not set";
};

/**
 * Validate audience form fields with detailed error information
 * @param platform - Platform key
 * @param fields - Fields object with values
 * @returns Validation result with success status and field-specific errors
 */
export const validateAudienceForm = (
  platform: string, 
  fields: Record<string, string>
): ValidationResult => {
  if (!platform) {
    return { success: false, errors: { platform: 'Platform is required' } };
  }
  
  const config = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!config) {
    return { success: false, errors: { platform: 'Invalid platform selected' } };
  }
  
  // Create dynamic schema based on platform requirements
  const fieldsSchema = z.object(
    Object.fromEntries(
      config.fields.map(field => [
        field.id, 
        z.string().min(1, `${field.label} is required`).trim()
      ])
    )
  );
  
  const result = fieldsSchema.safeParse(fields);
  
  if (result.success) {
    return { success: true };
  }
  
  // Convert Zod errors to field-specific error messages
  const errors: Record<string, string> = {};
  result.error.issues.forEach(issue => {
    const fieldPath = issue.path[0] as string;
    errors[fieldPath] = issue.message;
  });
  
  return { success: false, errors };
};

/**
 * Simple validation for quick checks (returns boolean only)
 * @param platform - Platform key
 * @param fields - Fields object with values
 * @returns True if all required fields are valid
 */
export const isAudienceFormValid = (
  platform: string, 
  fields: Record<string, string>
): boolean => {
  return validateAudienceForm(platform, fields).success;
};

/**
 * Create and validate a new audience object
 * @param platform - Platform key
 * @param label - Optional label
 * @param fields - Platform-specific field values
 * @param isActive - Whether audience is active (defaults to true)
 * @returns Validated ExclusionAudience object or throws validation error
 */
export const createAudience = (
  platform: string,
  label: string = '',
  fields: Record<string, string> = {},
  isActive: boolean = true
): ExclusionAudience => {
  const audienceData = {
    id: Date.now().toString(),
    platform,
    label: label.trim() || undefined,
    fields: { ...fields },
    enabled: isActive,
  };
  
  // Validate the created audience
  const result = ExclusionAudienceSchema.safeParse(audienceData);
  if (!result.success) {
    throw new Error(`Invalid audience data: ${result.error.message}`);
  }
  
  return result.data;
};

/**
 * Get status text for an audience
 * @param audience - The exclusion audience
 * @returns Status string ("Active" or "Inactive")
 */
export const getStatusText = (audience: ExclusionAudience): string => {
  return audience.enabled ? "Active" : "Inactive";
};

/**
 * Get toggle action text for an audience
 * @param audience - The exclusion audience
 * @returns Action text ("activated" or "deactivated")
 */
export const getToggleActionText = (audience: ExclusionAudience): string => {
  return audience.enabled ? "deactivated" : "activated";
};
