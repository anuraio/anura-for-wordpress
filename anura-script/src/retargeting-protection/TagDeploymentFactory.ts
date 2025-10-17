import { TagConfig } from "../types";
import { GoogleTagStrategy } from "./strategies/GoogleTagStrategy";
import { LinkedInTagStrategy } from "./strategies/LinkedInTagStrategy";
import { MetaTagStrategy } from "./strategies/MetaTagStrategy";
import { MicrosoftTagStrategy } from "./strategies/MicrosoftTagStrategy";
import { TikTokTagStrategy } from "./strategies/TikTokTagStrategy";
import { TwitterTagStrategy } from "./strategies/TwitterTagStrategy";
import { TagDeploymentManager } from "./TagDeploymentManager";

export class TagDeploymentFactory {
  static createManager(tagConfigs: TagConfig[]): TagDeploymentManager {
    const strategies = [
      new GoogleTagStrategy(),
      new MetaTagStrategy(),
      new MicrosoftTagStrategy(),
      new LinkedInTagStrategy(),
      new TwitterTagStrategy(),
      new TikTokTagStrategy()
    ];

    return new TagDeploymentManager(strategies, tagConfigs);
  }
}
