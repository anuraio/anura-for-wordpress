// ============================================================================
// Core Anura Types
// ============================================================================

export interface AnuraResult {
  isGood(): boolean;
  isBad(): boolean;
  isWarning(): boolean;
  getId(): string;
  getRuleSets(): string[];
  queryResult(callback: () => void): void;
}

/**
 * TypeScript interface for the anuraOptions object passed from PHP to JavaScript
 * This object is created by prepare_anura_settings() in AnuraUtilities.php
 * and localized to the browser via wp_localize_script()
 */
export interface AnuraOptions {
  context?: 'login';
  script: {
    instanceId: string;
    source?: string;
    campaign?: string;
    callbackFunction: string;
    sourceMethod: string;
    sourceValue?: string;
    campaignMethod: string;
    campaignValue?: string;
    additionalData: string[];
  };
  social: {
    retargetingProtection: {
      id: string;
      platform: "google" | "meta" | "microsoft" | "linkedin" | "tiktok" | "twitter" | string;
      tagId: string;
      label?: string;
      enabled: boolean;
    }[];
  };
  advanced: {
    contentDeployment: {
      enabled: boolean;
      javascript?: string;
    };
    requestTriggers: {
      enabled: boolean;
      triggers: RequestTrigger[];
    };
    fallbacks: {
      sources: string[];
      campaigns: string[];
    };
  };
  bots: {
    enabled: boolean;
    whitelist: BotPattern[];
  };
  realTimeActions: {
    stopAfterFirstElement?: boolean;
    retryDurationSeconds?: number;
    redirectAction: {
      resultCondition: 'noRedirect' | 'onWarning' | 'onBad' | 'onBoth';
      redirectURL?: string;
      webCrawlersAllowed?: boolean;
    };
    actions: {
      name: string;
      resultCondition: 'noDisable' | 'onWarning' | 'onBad' | 'onBoth';
    }[];
  };
  exclusionAudiences: {
    id: string;
    platform: string;
    label?: string;
    enabled: boolean;
    fields: Record<string, any>;
  }[];
}

// ============================================================================
// Tag-Related Types
// ============================================================================

export interface TagConfig {
  id: string;
  platform: "google" | "meta" | "microsoft" | "linkedin" | "tiktok" | "twitter" | string;
  tagId: string;
  label?: string;
  enabled: boolean;
}

export interface TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void;
  getPlatform(): string;
  // canHandle(platform: string): boolean;
}

// ============================================================================
// Bot Filtering Types
// ============================================================================

export interface BotPattern {
  id: string;
  name: string;
  platform?: string;
  type: "userAgent" | "location" | "referrer";
  pattern: string;
  enabled: boolean;
  isCustom: boolean;
}

export interface BotSettings {
  enabled: boolean;
  whitelist: BotPattern[];
}

// ============================================================================
// Request Trigger Types
// ============================================================================

export type RequestTrigger = {
  type: 'url' | 'path' | 'queryParam';
  pattern: string;
  condition: 'contains' | 'doesNotContain';
  enabled: boolean;
}

// ============================================================================
// Global Window Interface Extensions
// ============================================================================

declare global {
  interface Window {
    anuraOptions: AnuraOptions;
  }
}
