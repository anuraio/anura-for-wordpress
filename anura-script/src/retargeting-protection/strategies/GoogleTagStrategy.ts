import { TagConfig, TagDeploymentStrategy } from "../../types";

export class GoogleTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    const activeTags = tagConfigs.filter(
      (config) => config.platform === "google" && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map((config) => config.tagId);
    this.deployGtag(tagIds);
  }

  getPlatform(): string {
    return "google";
  }

  private deployGtag(tagIds: string[]): void {
    const gtagLoaded = typeof (window as any).gtag === 'function';
    if (gtagLoaded) {
      this.fireEvents(tagIds);
      return;
    }

    const an_gs = document.createElement("script");
    an_gs.src = "https://www.googletagmanager.com/gtag/js";
    an_gs.addEventListener("load", () => {
      (window as any).dataLayer = (window as any).dataLayer || [];

      function gtag(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;

      gtag("js", new Date());
      gtag("set", { cookie_flags: "SameSite=None;Secure" });

      this.fireEvents(tagIds);
    });

    document.head.appendChild(an_gs);
  }

  private fireEvents(tagIds: string[]): void {
    tagIds.forEach((tagId) => {
      (window as any).gtag("event", "page_view", { send_to: tagId });
    });
  }
}
