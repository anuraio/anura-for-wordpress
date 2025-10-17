interface ExclusionAudience {
  id: string;
  platform: string;
  label?: string;
  fields: Record<string, any>;
  enabled: boolean;
}

interface PlatformConfig {
  methodName: string;
  formatData: (audience: ExclusionAudience) => any;
}

export function hasExclusionAudiences(): boolean {
  const exclusionAudiences = window.anuraOptions.exclusionAudiences;
  return exclusionAudiences !== undefined && exclusionAudiences.length > 0;
}

export function addExclusionAudiences(): void {
  const anuraObj = window.Anura.getAnura();
  const resultIsGood = anuraObj.isGood();

  const exclusionAudiences = window.anuraOptions.exclusionAudiences;
  if (!exclusionAudiences || exclusionAudiences.length === 0 || resultIsGood) {
    return;
  }

  const audienceManager = new AudienceManager(window.Anura, exclusionAudiences);
  audienceManager.addExclusionAudiences();
}

class AudienceManager {
  private Anura: any;
  private exclusionAudiences: ExclusionAudience[];

  constructor(Anura: any, exclusionAudiences: ExclusionAudience[]) {
    this.Anura = Anura;
    this.exclusionAudiences = exclusionAudiences || [];
  }

  addExclusionAudiences(): void {
    const activeAudiences = this.exclusionAudiences.filter(
      (audience) => audience.enabled
    );

    if (activeAudiences.length === 0) {
      return;
    }

    const audiencesByPlatform = this.groupByPlatform(activeAudiences);

    for (const platform in audiencesByPlatform) {
      this.addPlatformExclusions(platform, audiencesByPlatform[platform]);
    }
  }

  private groupByPlatform(audiences: ExclusionAudience[]): Record<string, ExclusionAudience[]> {
    return audiences.reduce((groups: Record<string, ExclusionAudience[]>, audience) => {
      if (!groups[audience.platform]) {
        groups[audience.platform] = [];
      }

      groups[audience.platform].push(audience);
      return groups;
    }, {});
  }

  private addPlatformExclusions(platform: string, audiences: ExclusionAudience[]): void {
    let platformConfig: PlatformConfig;
    try {
      platformConfig = this.getPlatformConfig(platform);
    } catch (error) {
      return;
    }

    const methodName = platformConfig.methodName;

    if (methodName === "addExclusions") {
      const exclusionData = audiences.map((a) => platformConfig.formatData(a));
      this.Anura.getLib()[platform][methodName](exclusionData);
    } else if (methodName === "addExclusion") {
      const firstAudience = audiences[0];
      const exclusionData = platformConfig.formatData(firstAudience);
      this.Anura.getLib()[platform][methodName](exclusionData);
    }
  }

  private getPlatformConfig(platform: string): PlatformConfig {
    const configs: Record<string, PlatformConfig> = {
      google: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.adTagId,
      },
      linkedin: {
        methodName: "addExclusion",
        formatData: (audience) => [
          audience.fields.partnerId,
          audience.fields.event,
        ],
      },
      meta: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.pixelId,
      },
      microsoft: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.uetTagId,
      },
      snapchat: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.pixelId,
      },
      tiktok: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.pixelId,
      },
      pinterest: {
        methodName: "addExclusions",
        formatData: (audience) => audience.fields.tagId,
      },
      taboola: {
        methodName: "addExclusion",
        formatData: (audience) => audience.fields.accountId,
      },
      outbrain: {
        methodName: "addExclusion",
        formatData: (audience) => audience.fields.advertiserId
      },
      x: {
        methodName: "addExclusion",
        formatData: (audience) => audience.fields.eventId
      }
    };

    const config = configs[platform];
    if (!config) {
      throw new Error(
        `Unsupported platform: ${platform}. Supported platforms: ${Object.keys(
          configs
        ).join(", ")}`
      );
    }

    return config;
  }
}

window.hasExclusionAudiences = hasExclusionAudiences;
window.addExclusionAudiences = addExclusionAudiences;

export {};